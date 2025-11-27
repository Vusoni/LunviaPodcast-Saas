"use client";

import { Protect } from "@clerk/nextjs";
import { ErrorRetryCard } from "./error-retry-card";
import { GenerateMissingCard } from "./generate-missing-card";
import { TabSkeleton } from "./tab-skeleton";
import { UpgradePrompt } from "./upgrade-prompt";
import type { Id } from "@/convex/_generated/dataModel";
import type { FeatureName } from "@/lib/tier-config";
import type { RetryableJob } from "@/app/actions/retry-job";

interface TabContentProps {
  isLoading: boolean;
  data: unknown;
  error?: string;
  children: React.ReactNode;
  // Optional props for enhanced error/empty handling
  projectId?: Id<"projects">;
  feature?: FeatureName;
  featureName?: string;
  jobName?: RetryableJob;
  emptyMessage?: string;
}

/**
 * Enhanced TabContent wrapper component
 *
 * Handles common patterns across all tabs:
 * 1. Loading state (shows skeleton)
 * 2. Error state (shows retry card)
 * 3. Empty state (shows generate missing card)
 * 4. Content rendering with optional feature gating
 */
export function TabContent({
  isLoading,
  data,
  error,
  children,
  projectId,
  feature,
  featureName,
  jobName,
  emptyMessage = "No data available",
}: TabContentProps) {
  // Helper to wrap content with feature gating if needed
  const wrapWithProtect = (content: React.ReactNode) => {
    if (!feature || !featureName) return content;

    return (
      <Protect
        feature={feature}
        fallback={
          <UpgradePrompt
            feature={featureName}
            featureKey={feature}
            currentPlan="free"
          />
        }
      >
        {content}
      </Protect>
    );
  };

  // Loading state
  if (isLoading) {
    return <TabSkeleton />;
  }

  // Simple pass-through if enhanced props not provided (backward compatible)
  if (!projectId || !jobName) {
    return <>{children}</>;
  }

  // Error state
  if (error) {
    return wrapWithProtect(
      <ErrorRetryCard
        projectId={projectId}
        job={jobName}
        errorMessage={error}
      />,
    );
  }

  // Empty state
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return wrapWithProtect(
      <GenerateMissingCard projectId={projectId} message={emptyMessage} />,
    );
  }

  // Content rendering
  return wrapWithProtect(children);
}
