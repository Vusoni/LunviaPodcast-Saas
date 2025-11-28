// Export name of plans
export type PlanName = "free" | "standard" | "premium";

export interface PlanLimits {
  maxProjects: number | null; // null = unlimited
  maxFileSize: number; // bytes
  maxDuration: number | null; // seconds, null = unlimited
}

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: {
    maxProjects: 3, // lifetime, including deleted
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxDuration: 600, // 10 minutes
  },
  standard: {
    maxProjects: 30, // active projects only
    maxFileSize: 200 * 1024 * 1024, // 200MB
    maxDuration: 7200, // 2 hours
  },
  premium: {
    maxProjects: null, // unlimited
    maxFileSize: 3 * 1024 * 1024 * 1024, // 3GB
    maxDuration: null, // unlimited
  },
};

/**
 * Feature names corresponding to Clerk billing features
 * These should match the feature identifiers in Clerk Dashboard
 *
 * Note: Transcription is NOT a feature - it's core functionality available to all plans
 */
export const FEATURES = {
  SUMMARY: "summary",
  SOCIAL_MEDIA_POSTS: "SOCIAL_MEDIA_POSTS",
  TITLES: "titles",
  HASHTAGS: "hashtags",
  VIDEO_TIMESTAMPS: "video_timestamps",
  KEY_MOMENTS: "key_moments",
  SPEAKER_DIARIZATION: "speaker_diarization",
} as const;

export type FeatureName = (typeof FEATURES)[keyof typeof FEATURES];

/**
 * Features available to each plan
 * Maps plan names to their available features
 *
 * Note: Transcription is available to ALL plans as core functionality
 */
export const PLAN_FEATURES: Record<PlanName, FeatureName[]> = {
  free: [FEATURES.SUMMARY],
  standard: [
    FEATURES.SUMMARY,
    FEATURES.SOCIAL_MEDIA_POSTS,
    FEATURES.TITLES,
    FEATURES.HASHTAGS,
  ],
  premium: [
    FEATURES.SUMMARY,
    FEATURES.SOCIAL_MEDIA_POSTS,
    FEATURES.TITLES,
    FEATURES.HASHTAGS,
    FEATURES.VIDEO_TIMESTAMPS,
    FEATURES.KEY_MOMENTS,
    FEATURES.SPEAKER_DIARIZATION,
  ],
};

/**
 * Human-readable plan names for UI display
 */
export const PLAN_NAMES: Record<PlanName, string> = {
  free: "Free",
  standard: "standard",
  premium: "premium",
};

/**
 * Price information for upgrade messaging
 */
export const PLAN_PRICES: Record<PlanName, string> = {
  free: "$0",
  standard: "$25/month",
  premium: "$49/month",
};

export const FEATURE_TO_JOB_MAP = {
  [FEATURES.SOCIAL_MEDIA_POSTS]: "SocialMediaPosts",
  [FEATURES.TITLES]: "titles",
  [FEATURES.HASHTAGS]: "hashtags",
  [FEATURES.KEY_MOMENTS]: "keyMoments",
  [FEATURES.VIDEO_TIMESTAMPS]: "videoTimestamps",
  [FEATURES.SUMMARY]: "summary",
} as const;

export type JobName =
  (typeof FEATURE_TO_JOB_MAP)[keyof typeof FEATURE_TO_JOB_MAP];
