import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { PodcastUploader } from "@/components/podcast-uploader";
import { Button } from "@/components/ui/button";

export async function HeroSection() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <section className="relative overflow-hidden px-4 pt-24">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/5 to-transparent opacity-20" />
      <div className="container mx-auto relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="space-y-10">
            <p className="accent-text">AI-first podcast operating system</p>
            <h1 className="text-4xl md:text-5xl lg:text-[4.25rem] leading-tight font-semibold">
              Minimal workflows for creators who live in the dark mode.
            </h1>
            <p className="text-lg text-white/70 max-w-xl">
              Upload a single audio file and receive transcripts, summaries, key
              moments, and platform-ready social content—without leaving this tab.
            </p>

            {isSignedIn ? (
              <div className="space-y-4">
                <div className="soft-focus rounded-2xl p-6">
                  <PodcastUploader />
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  Processing runs on Lunvia’s secure AI pipeline in real time.
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                <SignInButton mode="modal">
                  <Button className="button-solid bg-white text-black">
                    Start creating
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                </SignInButton>
                <Link href="/dashboard/projects">
                  <Button className="button-ghost">
                    View projects
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="minimal-card blurred-edge">
              <p className="accent-text mb-6">Outputs in minutes</p>
              <ul className="space-y-4 text-white/80">
                {[
                  "Timeline-accurate transcripts",
                  "Key moments + chapter art",
                  "Social posts tailored per platform",
                  "SEO-ready titles & hashtags",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="minimal-card surface-muted space-y-5">
              <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/50">
                <span>Private pipeline</span>
                <span className="h-px flex-1 bg-white/10" />
                <span>Real-time</span>
              </div>
              <p className="text-white/65 text-sm leading-relaxed">
                Every upload stays encrypted in-flight and at rest. The AI stack runs on isolated workers tuned for long-form audio.
              </p>
              <div className="grid grid-cols-2 gap-4 text-white/80 text-sm">
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-3xl font-semibold">2.4M+</p>
                  <p className="text-white/50 text-[0.65rem] uppercase tracking-[0.3em]">
                    Minutes processed
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-3xl font-semibold">99.9%</p>
                  <p className="text-white/50 text-[0.65rem] uppercase tracking-[0.3em]">
                    Uptime this year
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
