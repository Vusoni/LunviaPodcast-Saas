import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function CtaSection() {
  // Check for user signed in
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <section className="px-4">
      <div className="container mx-auto">
        <div className="minimal-card surface-muted border-white/10 text-center space-y-6">
          <p className="accent-text">Next action</p>
          <h2 className="text-3xl md:text-4xl font-semibold">
            Ship your next episode deliverables in under ten minutes.
            </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Upload once, review the generated assets, then publish. We keep the UI
            calm so you can think clearly.
            </p>

          {isSignedIn ? (
              <Link href="/dashboard/upload">
              <Button className="button-solid bg-white text-black">
                <Upload className="mr-2 h-4 w-4" />
                Upload your next file
                </Button>
              </Link>
            ) : (
              <SignInButton mode="modal">
              <Button className="button-solid bg-white text-black">
                Join Lunvia
                <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            )}
        </div>
      </div>
    </section>
  );
}
