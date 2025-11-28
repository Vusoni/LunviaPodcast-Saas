import { api } from "@/convex/_generated/api";
import { convex } from "@/lib/convex-client";
import type { PlanName } from "@/lib/tier-config";
import { inngest } from "../client";
import { generateHashtags } from "../steps/ai-generation/hashtags";
import { generateKeyMoments } from "../steps/ai-generation/key-moments";
import { generateSocialMediaPosts } from "../steps/ai-generation/social-posts";
import { generateSummary } from "../steps/ai-generation/summary";
import { generateTitles } from "../steps/ai-generation/titles";
import { generateYouTubeTimestamps } from "../steps/ai-generation/video-timestamps";
import { saveResultsToConvex } from "../steps/persistence/save-to-convex";
import { transcribeWithAssemblyAI } from "../steps/transcription/assemblyai";

export const podcastProcessor = inngest.createFunction(
  {
    id: "podcast-processor",
    optimizeParallelism: true,
    retries: 3,
  },

  { event: "podcast/uploaded" },
  async ({ event, step }) => {
    const { projectId, fileUrl, plan: userPlan } = event.data;
    const plan = (userPlan as PlanName) || "free"; // Default to free if not provided

    console.log(`Processing project ${projectId} for ${plan} plan`);

    // Inngest steps to process
    try {
      // Mark project as processing in Convex (UI will show "Processing..." state)
      await step.run("update-status-processing", async () => {
        await convex.mutation(api.projects.updateProjectStatus, {
          projectId,
          status: "processing",
        });
      });

      // Update jobStatus: transcription starting
      await step.run("update-job-status-transcription-running", async () => {
        await convex.mutation(api.projects.updateJobStatus, {
          projectId,
          transcription: "running",
        });
      });

      // Step 1: Transcribe audio with AssemblyAI (sequential - blocks next steps)
      // This step is durable: if it fails, Inngest retries automatically
      // Speaker diarization is always enabled; UI access is gated by plan
      const transcript = await step.run("transcribe-audio", () =>
        transcribeWithAssemblyAI(fileUrl, projectId, plan)
      );

      // Update jobStatus: transcription complete
      await step.run("update-job-status-transcription-completed", async () => {
        await convex.mutation(api.projects.updateJobStatus, {
          projectId,
          transcription: "completed",
        });
      });

      // Update jobStatus: content generation starting
      await step.run("update-job-status-generation-running", async () => {
        await convex.mutation(api.projects.updateJobStatus, {
          projectId,
          contentGeneration: "running",
        });
      });

      // Step 2: Run AI generation tasks in parallel based on plan
      // Parallel Pattern: Promise.allSettled allows individual failures without blocking others
      // Performance: ~60s total vs. ~300s sequential (5x faster)
      // Each function can fail independently - we save whatever succeeds

      // Determine which jobs to run based on plan
      const jobs: Promise<any>[] = [];
      const jobNames: string[] = [];

      // Summary - available to all plans
      jobs.push(generateSummary(step, transcript));
      jobNames.push("summary");

      // PRO and ULTRA features
      if (plan === "standard" || plan === "premium") {
        jobs.push(generateSocialMediaPosts(step, transcript));
        jobNames.push("SocialMediaPosts");

        jobs.push(generateTitles(step, transcript));
        jobNames.push("titles");

        jobs.push(generateHashtags(step, transcript));
        jobNames.push("hashtags");
      } else {
        console.log(`Skipping social posts, titles, hashtags for ${plan} plan`);
      }

      // ULTRA-only features
      if (plan === "premium") {
        jobs.push(generateKeyMoments(transcript));
        jobNames.push("keyMoments");

        jobs.push(generateYouTubeTimestamps(step, transcript));
        jobNames.push("youtubeTimestamps");
      } else {
        console.log(
          `Skipping key moments and YouTube timestamps for ${plan} plan`
        );
      }

      // Run all enabled jobs in parallel
      const results = await Promise.allSettled(jobs);

      // Extract successful results based on plan
      // Build results object dynamically based on what was run
      const generatedContent: Record<string, any> = {};

      results.forEach((result, idx) => {
        const jobName = jobNames[idx];
        if (result.status === "fulfilled") {
          generatedContent[jobName] = result.value;
        }
      });

      // Track errors for each failed job
      const jobErrors: Record<string, string> = {};

      results.forEach((result, idx) => {
        if (result.status === "rejected") {
          const jobName = jobNames[idx];
          const errorMessage =
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason);

          jobErrors[jobName] = errorMessage;
          console.error(`Failed to generate ${jobName}:`, result.reason);
        }
      });

      // Save errors to Convex if any jobs failed
      if (Object.keys(jobErrors).length > 0) {
        await step.run("save-job-errors", () =>
          convex.mutation(api.projects.saveJobErrors, {
            projectId,
            jobErrors,
          })
        );
      }

      // Update jobStatus: content generation complete
      await step.run("update-job-status-generation-completed", async () => {
        await convex.mutation(api.projects.updateJobStatus, {
          projectId,
          contentGeneration: "completed",
        });
      });

      // Step 3: Save all results to Convex in one atomic operation
      // Convex mutation updates the project, triggering UI re-render
      await step.run("save-results-to-convex", () =>
        saveResultsToConvex(projectId, generatedContent)
      );

      // Workflow complete - return success
      return { success: true, projectId, plan };
    } catch (error) {
      // Handle any errors that occur during the workflow
      console.error("Podcast processing failed:", error);

      // Update project status to failed with error details
      // NOTE: NOT wrapped in step.run() so this executes immediately, even during retries
      try {
        await convex.mutation(api.projects.recordError, {
          projectId,
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          step: "workflow",
          details: error instanceof Error ? { stack: error.stack } : undefined,
        });
      } catch (cleanupError) {
        // If cleanup fails, log it but don't prevent the original error from being thrown
        console.error("Failed to update project status:", cleanupError);
      }

      // Re-throw to mark function as failed in Inngest (triggers retry if attempts remain)
      throw error;
    }
  }
);
