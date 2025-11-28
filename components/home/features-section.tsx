import {
  FileText,
  Hash,
  type LucideIcon,
  MessageSquare,
  Sparkles,
  Zap,
  Users,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "Autonomous analysis",
    description:
      "AssemblyAI processing understands tone, structure, and speakers before any generation begins.",
  },
  {
    icon: FileText,
    title: "Longform transcripts",
    description:
      "Precision transcripts with timestamps and diarization, ready for editing or publishing.",
  },
  {
    icon: MessageSquare,
    title: "Platform copy",
    description:
      "Auto-written captions & posts for Twitter, LinkedIn, Instagram, TikTok, and more.",
  },
  {
    icon: Hash,
    title: "SEO ready",
    description:
      "Generate titles, descriptions, and keyword sets tailored to your episode themes.",
  },
  {
    icon: Zap,
    title: "Key moments",
    description:
      "Segment detection finds the moments worth clipping and suggests timestamped chapters.",
  },
  {
    icon: Users,
    title: "Collaboration ready",
    description:
      "Share secure links with editors or clients—every asset stays synced inside Lunvia.",
  },
];

export function FeaturesSection() {
  return (
    <section className="px-4">
      <div className="container mx-auto">
        <div className="flex flex-col gap-4 text-left mb-12">
          <p className="accent-text">Feature stack</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <h2 className="text-3xl md:text-4xl font-semibold flex-1">
              A single upload fans out into every asset your team needs.
            </h2>
            <p className="text-white/60 max-w-xl">
              Each block inherits the same neutral palette so your content, not the
              interface, takes center stage.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="minimal-card border border-white/10 bg-gradient-to-b from-white/5 to-transparent"
              >
                <Icon className="mb-6 h-6 w-6 text-white" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
