// Schema for convex database
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

// Create Project Mutation
export const createProject = mutation({
  args: {
    userId: v.string(),
    inputUrl: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    fileDuration: v.optional(v.number()),
    fileFormat: v.string(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now(); // Create new date

    const projectId = await ctx.db.insert("projects", {
      userId: args.userId,
      inputUrl: args.inputUrl,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileDuration: args.fileDuration,
      fileFormat: args.fileFormat,
      mimeType: args.mimeType,
      status: "uploaded",
      jobStatus: {
        transcription: "pending",
        contentGeneration: "pending",
      },
      createdAt: now,
      updatedAt: now,
    });

    return projectId;
  },
});

// Update Project
export const updateProjectStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(
      v.literal("uploaded"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const updates: Partial<Doc<"projects">> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    // Track completion time for analytics and billing
    if (args.status === "completed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.projectId, updates);
  },
});

// Save Transcript
export const saveTranscript = mutation({
  args: {
    projectId: v.id("projects"),
    transcript: v.object({
      text: v.string(),
      segments: v.array(
        v.object({
          id: v.number(),
          start: v.number(),
          end: v.number(),
          text: v.string(),
          words: v.optional(
            v.array(
              v.object({
                word: v.string(),
                start: v.number(),
                end: v.number(),
              })
            )
          ),
        })
      ),
      speakers: v.optional(
        v.array(
          v.object({
            speaker: v.string(),
            start: v.number(),
            end: v.number(),
            text: v.string(),
            confidence: v.number(),
          })
        )
      ),
      chapters: v.optional(
        v.array(
          v.object({
            start: v.number(),
            end: v.number(),
            headline: v.string(),
            summary: v.string(),
            gist: v.string(),
          })
        )
      ),
    }),
  },
  handler: async (ctx, args) => {
    // Store transcript directly in Convex for instant access
    await ctx.db.patch(args.projectId, {
      transcript: args.transcript,
      updatedAt: Date.now(),
    });
  },
});

// Update Job
export const updateJobStatus = mutation({
  args: {
    projectId: v.id("projects"),
    transcription: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    contentGeneration: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const updates: Partial<Doc<"projects">> = {
      jobStatus: {
        ...project.jobStatus,
        ...(args.transcription && { transcription: args.transcription }),
        ...(args.contentGeneration && {
          contentGeneration: args.contentGeneration,
        }),
      },
      updatedAt: Date.now(),
    };

    await ctx.db.patch(args.projectId, updates);
  },
});

// Save Generated Mutation
export const saveGeneratedContent = mutation({
  args: {
    projectId: v.id("projects"),
    keyMoments: v.optional(
      v.array(
        v.object({
          time: v.string(),
          timestamp: v.number(),
          text: v.string(),
          description: v.string(),
        })
      )
    ),
    summary: v.optional(
      v.object({
        full: v.string(),
        bullets: v.array(v.string()),
        insights: v.array(v.string()),
        tldr: v.string(),
      })
    ),
    SocialMediaPosts: v.optional(
      v.object({
        twitter: v.string(),
        linkedin: v.string(),
        instagram: v.string(),
        tiktok: v.string(),
        Video: v.string(),
        facebook: v.string(),
      })
    ),
    titles: v.optional(
      v.object({
        VideoShort: v.array(v.string()),
        VideoLong: v.array(v.string()),
        podcastTitles: v.array(v.string()),
        seoKeywords: v.array(v.string()),
      })
    ),
    hashtags: v.optional(
      v.object({
        Video: v.array(v.string()),
        instagram: v.array(v.string()),
        tiktok: v.array(v.string()),
        linkedin: v.array(v.string()),
        twitter: v.array(v.string()),
      })
    ),
    VideoTimestamps: v.optional(
      v.array(
        v.object({
          timestamp: v.string(),
          description: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Destructure Arguments
    const { projectId, ...content } = args;

    await ctx.db.patch(projectId, {
      ...content,
      updatedAt: Date.now(),
    });
  },
});

// Record error mutation
export const recordError = mutation({
  args: {
    projectId: v.id("projects"),
    message: v.string(),
    step: v.string(),
    details: v.optional(
      v.object({
        statusCode: v.optional(v.number()),
        stack: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Mark project as failed and store error details
    await ctx.db.patch(args.projectId, {
      status: "failed",
      error: {
        message: args.message,
        step: args.step,
        timestamp: Date.now(),
        details: args.details,
      },
      updatedAt: Date.now(),
    });
  },
});

// Save Job
export const saveJobErrors = mutation({
  args: {
    projectId: v.id("projects"),
    jobErrors: v.object({
      keyMoments: v.optional(v.string()),
      summary: v.optional(v.string()),
      SocialMediaPosts: v.optional(v.string()),
      titles: v.optional(v.string()),
      hashtags: v.optional(v.string()),
      VideoTimestamps: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      jobErrors: args.jobErrors,
      updatedAt: Date.now(),
    });
  },
});

// Get Project
export const getProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Simple ID lookup - Convex makes this extremely fast
    return await ctx.db.get(args.projectId);
  },
});

// List User Projects
export const listUserProjects = query({
  args: {
    userId: v.string(),
    paginationOpts: v.optional(
      v.object({
        numItems: v.number(),
        cursor: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const numItems = args.paginationOpts?.numItems ?? 20;

    const query = ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc");

    // Built-in pagination with cursor support
    return await query.paginate({
      numItems,
      cursor: args.paginationOpts?.cursor ?? null,
    });
  },
});

// Get User Project
export const getUserProjectCount = query({
  args: {
    userId: v.string(),
    includeDeleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Query all projects by this user
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Filter based on includeDeleted flag
    if (args.includeDeleted) {
      // Count all projects (including soft-deleted ones)
      return projects.length;
    } else {
      // Count only active projects (exclude soft-deleted)
      return projects.filter((p) => !p.deletedAt).length;
    }
  },
});

// Delete Project
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Fetch project to validate ownership and get inputUrl
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    // Security check: ensure user owns this project
    if (project.userId !== args.userId) {
      throw new Error("Unauthorized: You don't own this project");
    }

    // Soft delete: set deletedAt timestamp instead of hard delete
    // This preserves the record for FREE tier counting
    await ctx.db.patch(args.projectId, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Return inputUrl so server action can delete from Blob storage
    return { inputUrl: project.inputUrl };
  },
});

// Update Project Display Name
export const updateProjectDisplayName = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    // Fetch project to validate ownership
    const project = await ctx.db.get(args.projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    // Security check: ensure user owns this project
    if (project.userId !== args.userId) {
      throw new Error("Unauthorized: You don't own this project");
    }

    // Update display name
    await ctx.db.patch(args.projectId, {
      displayName: args.displayName.trim(),
      updatedAt: Date.now(),
    });
  },
});
