"use client";

import { Badge } from "@/components/ui/badge";

interface HashtagsTabProps {
  hashtags?: {
    youtube: string[];
    instagram: string[];
    tiktok: string[];
    linkedin: string[];
    twitter: string[];
  };
}

const PLATFORMS = [
  { key: "youtube" as const, title: "YouTube" },
  { key: "instagram" as const, title: "Instagram" },
  { key: "tiktok" as const, title: "TikTok" },
  { key: "linkedin" as const, title: "LinkedIn" },
  { key: "twitter" as const, title: "Twitter" },
];

export function HashtagsTab({ hashtags }: HashtagsTabProps) {
  // TabContent ensures this is never undefined at runtime
  if (!hashtags) return null;

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 gradient-emerald-text">
        Platform Hashtags
      </h3>
      <div className="space-y-4 md:space-y-6">
        {PLATFORMS.map((platform) => (
          <div key={platform.key} className="p-4 md:p-5 glass-card rounded-xl">
            <p className="text-sm md:text-base font-bold mb-3 md:mb-4 text-gray-900">
              {platform.title}
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {hashtags[platform.key].map((tag, idx) => (
                <Badge
                  key={`${platform.key}-${idx}`}
                  className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-emerald-100 text-emerald-700 border-emerald-200 wrap-break-word"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
