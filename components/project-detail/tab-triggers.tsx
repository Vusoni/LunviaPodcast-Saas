/**
 * Tab Trigger Components for Project Detail Page
 *
 * Reusable components to render tab triggers consistently across
 * mobile dropdown and desktop tabs, using centralized configuration.
 */

"use client";

import { Protect } from "@clerk/nextjs";
import { AlertCircle, Lock } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { TabsTrigger } from "@/components/ui/tabs";
import type { Doc } from "@/convex/_generated/dataModel";
import type { TabConfig } from "@/lib/tab-config";

interface TabTriggerItemProps {
  tab: TabConfig;
  project: Doc<"projects">;
}

/**
 * Mobile dropdown item for a tab
 */
export function MobileTabItem({ tab, project }: TabTriggerItemProps) {
  const hasError =
    tab.errorKey &&
    project.jobErrors?.[tab.errorKey as keyof typeof project.jobErrors];

  return (
    <SelectItem value={tab.value}>
      <span className="flex items-center gap-2">
        {tab.label}
        {hasError && <AlertCircle className="h-4 w-4 text-destructive" />}
        {tab.feature && (
          <Protect
            feature={tab.feature}
            fallback={<Lock className="h-3 w-3" />}
          />
        )}
      </span>
    </SelectItem>
  );
}

/**
 * Desktop tab trigger for a tab
 */
export function DesktopTabTrigger({ tab, project }: TabTriggerItemProps) {
  const hasError =
    tab.errorKey &&
    project.jobErrors?.[tab.errorKey as keyof typeof project.jobErrors];

  return (
    <TabsTrigger
      value={tab.value}
      className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl data-[state=active]:bg-linear-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-400 data-[state=active]:text-white transition-all font-semibold whitespace-nowrap"
    >
      {tab.label}
      {hasError && <AlertCircle className="h-4 w-4 text-destructive" />}
      {tab.feature && (
        <Protect
          feature={tab.feature}
          fallback={<Lock className="h-3 w-3" />}
        />
      )}
    </TabsTrigger>
  );
}
