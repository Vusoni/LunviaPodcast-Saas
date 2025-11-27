//Client side component
"use server";

import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";
import { checkUploadLimits } from "@/lib/tier-utils";

export async function validateUploadAction(input: {
  fileSize: number;
  duration?: number;
}): Promise<{ success: boolean; error?: string }> {
  const authObj = await auth();
  const { userId } = authObj;

  if (!userId) {
    return { success: false, error: "You must be signed in to upload files" };
  }

  const validation = await checkUploadLimits(
    authObj,
    userId,
    input.fileSize,
    input.duration
  );

  if (!validation.allowed) {
    console.log("[VALIDATE] Failed:", {
      userId,
      reason: validation.reason,
      message: validation.message,
    });
    return { success: false, error: validation.message };
  }

  console.log("[VALIDATE] Passed:", { userId, fileSize: input.fileSize });
  return { success: true };
}

interface CreateProjectInput {
  fileUrl: string; // Vercel Blob URL
  fileName: string; // Original filename
  fileSize: number; // Bytes
  mimeType: string; // MIME type
  fileDuration?: number; // Seconds (optional)
}

// Create Project - Add project to convex database
export async function createProjectAction(input: CreateProjectInput) {
  try {
    // Authenticate user - User should be authenticated in order to create project
    const authObj = await auth();
    const { userId } = authObj;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Destructure data from input
    const { fileUrl, fileName, fileSize, mimeType, fileDuration } = input;

    // Validate required fields
    if (!fileUrl || !fileName) {
      throw new Error("Missing required fields");
    }

    // Validate limits using Clerk's has() method
    const { has } = authObj;

    // Determine user's plan using Clerk
    let plan: "free" | "pro" | "ultra" = "free";
    if (has?.({ plan: "ultra" })) {
      plan = "ultra";
    } else if (has?.({ plan: "pro" })) {
      plan = "pro";
    }

    const validation = await checkUploadLimits(
      authObj,
      userId,
      fileSize || 0,
      fileDuration
    );

    if (!validation.allowed) {
      throw new Error(validation.message || "Upload not allowed for your plan");
    }

    const fileExtension = fileName.split(".").pop() || "unknown";

    const projectId = await convex.mutation(api.projects.createProject, {
      userId,
      inputUrl: fileUrl,
      fileName,
      fileSize: fileSize || 0,
      fileDuration,
      fileFormat: fileExtension,
      mimeType: mimeType,
    });

    await inngest.send({
      name: "podcast/uploaded",
      data: {
        projectId, // Convex project ID
        userId,
        plan, // Pass user's current plan for conditional generation
        fileUrl, // URL to audio file in Blob
        fileName,
        fileSize: fileSize || 0,
        mimeType: mimeType,
      },
    });

    return { success: true, projectId };
  } catch (error) {
    console.error("Error creating project:", error);
    throw error; // Re-throw for client error handling
  }
}

// Delete Projects
export async function deleteProjectAction(projectId: Id<"projects">) {
  try {
    // Authenticate user via Clerk
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Delete from Convex (validates ownership, returns inputUrl)
    const result = await convex.mutation(api.projects.deleteProject, {
      projectId,
      userId,
    });

    // Delete file from Vercel Blob
    // If this fails, we've already deleted from DB - log but don't throw
    try {
      await del(result.inputUrl);
    } catch (blobError) {
      console.error("Failed to delete file from Blob storage:", blobError);
      // Don't throw - project is already deleted from database
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
}

// Update Display Name Action
export async function updateDisplayNameAction(
  projectId: Id<"projects">,
  displayName: string
) {
  try {
    // Authenticate user via Clerk
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Validate display name
    if (!displayName || displayName.trim().length === 0) {
      throw new Error("Display name cannot be empty");
    }

    if (displayName.length > 200) {
      throw new Error("Display name is too long (max 200 characters)");
    }

    // Update in Convex (validates ownership)
    await convex.mutation(api.projects.updateProjectDisplayName, {
      projectId,
      userId,
      displayName: displayName.trim(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating display name:", error);
    throw error;
  }
}
