// Sever side
"use server";

// Imports
import { inngest } from "../inngest/client";
import { auth } from "@clerk/nextjs/server";
import type { Id } from "@/convex/_generated/dataModel";
// Removed getUserPlan - using Clerk's has() directly per docs
import { convex } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";

export type RetryableJob =
  | "keyMoments"
  | "summary"
  | "SocialMediaPosts"
  | "titles"
  | "hashtags"
  | "VideoTimestamps";

export async function retryJob(projectId: Id<"projects">, job: RetryableJob) {
  const authObj = await auth();
  const { userId, has } = authObj;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get user's current plan using Clerk's has() method
  let currentPlan: "free" | "standard" | "premium" = "free";
  if (has?.({ plan: "premium" })) {
    currentPlan = "premium";
  } else if (has?.({ plan: "standard" })) {
    currentPlan = "standard";
  }

  // Get project to check what was already generated
  const project = await convex.query(api.projects.getProject, { projectId });

  if (!project) {
    throw new Error("Project not found");
  }

  // Infer original plan from what features were generated
  let originalPlan: "free" | "standard" | "premium" = "free";
  if (project.keyMoments || project.VideoTimestamps) {
    originalPlan = "premium";
  } else if (project.SocialMediaPosts || project.titles || project.hashtags) {
    originalPlan = "standard";
  }

  // Trigger Inngest event to retry the specific job
  // Pass both original and current plans to detect upgrades
  await inngest.send({
    name: "podcast/retry-job",
    data: {
      projectId,
      job,
      userId,
      originalPlan,
      currentPlan,
    },
  });

  return { success: true };
}
