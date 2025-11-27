/**
 * Tab Configuration for Project Detail Page
 *
 * Centralizes tab definitions to avoid duplication between mobile/desktop views.
 * Each tab has:
 * - value: unique identifier for the tab
 * - label: display name
 * - errorKey: key in project.jobErrors to check for errors (optional)
 * - feature: Clerk feature key for access control (optional)
 */

import { FEATURES, type FeatureName } from "./tier-config";

export interface TabConfig {
  value: string;
  label: string;
  errorKey?: string;
  feature?: FeatureName;
}

export const PROJECT_TABS: TabConfig[] = [
  {
    value: "summary",
    label: "Summary",
    errorKey: "summary",
    // No feature - available to all
  },
  {
    value: "moments",
    label: "Key Moments",
    errorKey: "keyMoments",
    feature: FEATURES.KEY_MOMENTS,
  },
  {
    value: "youtube-timestamps",
    label: "YouTube Timestamps",
    errorKey: "youtubeTimestamps",
    feature: FEATURES.YOUTUBE_TIMESTAMPS,
  },
  {
    value: "social",
    label: "Social Posts",
    errorKey: "socialPosts",
    feature: FEATURES.SOCIAL_POSTS,
  },
  {
    value: "hashtags",
    label: "Hashtags",
    errorKey: "hashtags",
    feature: FEATURES.HASHTAGS,
  },
  {
    value: "titles",
    label: "Titles",
    errorKey: "titles",
    feature: FEATURES.TITLES,
  },
  {
    value: "speakers",
    label: "Speaker Dialogue",
    // No errorKey - this uses transcript data
    feature: FEATURES.SPEAKER_DIARIZATION,
  },
];
