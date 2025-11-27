"use client";

import { Badge } from "@/components/ui/badge";

interface TitlesTabProps {
  titles?: {
    youtubeShort: string[];
    youtubeLong: string[];
    podcastTitles: string[];
    seoKeywords: string[];
  };
}

const TITLE_CATEGORIES = [
  {
    key: "youtubeShort" as const,
    title: "YouTube Short Titles",
    type: "list" as const,
  },
  {
    key: "youtubeLong" as const,
    title: "YouTube Long Titles",
    type: "list" as const,
  },
  {
    key: "podcastTitles" as const,
    title: "Podcast Titles",
    type: "list" as const,
  },
  {
    key: "seoKeywords" as const,
    title: "SEO Keywords",
    type: "badges" as const,
  },
];

export function TitlesTab({ titles }: TitlesTabProps) {
  // TabContent ensures this is never undefined at runtime
  if (!titles) return null;

  return (
    <div className="space-y-6">
      {TITLE_CATEGORIES.map((category) => (
        <div key={category.key} className="glass-card rounded-2xl p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 gradient-emerald-text">
            {category.title}
          </h3>
          {category.type === "list" ? (
            <ul className="space-y-3">
              {titles[category.key].map((title) => (
                <li
                  key={title}
                  className="p-3 md:p-4 glass-card rounded-xl border-l-4 border-l-emerald-400"
                >
                  <p className="text-sm md:text-base text-gray-700 font-medium wrap-break-word">
                    {title}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-wrap gap-2 md:gap-3">
              {titles[category.key].map((keyword) => (
                <Badge
                  key={keyword}
                  className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm gradient-emerald text-white shadow-md wrap-break-word"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
