"use client";

import { Badge } from "@/components/ui/badge";

interface KeyMomentsTabProps {
  keyMoments?: {
    time: string;
    text: string;
    description: string;
  }[];
}

export function KeyMomentsTab({ keyMoments }: KeyMomentsTabProps) {
  // TabContent ensures this is never undefined at runtime
  if (!keyMoments) return null;

  return (
    <div className="glass-card rounded-2xl p-8">
      <h3 className="text-2xl font-bold mb-8 gradient-emerald-text">
        Key Timestamps
      </h3>
      <div className="space-y-6">
        {keyMoments.map((moment, idx) => (
          <div
            key={`${idx}-${moment.time}`}
            className="flex items-start gap-4 md:gap-6 p-4 md:p-6 glass-card rounded-xl border-l-4 border-l-emerald-400"
          >
            <Badge className="mt-1 gradient-emerald text-white px-3 py-2 text-sm md:text-base font-bold shadow-md shrink-0">
              {moment.time}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base md:text-lg text-gray-900 mb-2 wrap-break-word">
                {moment.text}
              </p>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed wrap-break-word">
                {moment.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
