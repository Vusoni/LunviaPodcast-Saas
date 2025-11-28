"use client";

import { Protect, SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Crown, Home, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Header Component from Shadcn
export function Header() {
	// Check for auth user
	const { isSignedIn } = useAuth();
	const pathname = usePathname();
	const isDashboard = pathname?.startsWith("/dashboard"); // check if url starts "/dashboard"
	const showDashboardNav = isDashboard;

	const shellClass = isDashboard
		? "sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl"
		: "sticky top-0 z-50 border-b border-white/5 bg-black/70 backdrop-blur-2xl";

	const primaryButtonClasses =
		"rounded-full px-4 lg:px-5 py-2 text-sm font-semibold transition-colors duration-200";

	return (
		<header className={shellClass}>
			<div className="container mx-auto px-4 lg:px-6">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center gap-3 lg:gap-8">
						<Link
							href="/"
							className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity"
						>
							<div className="h-9 w-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
								<Sparkles className="h-4 w-4" />
							</div>
							<span className="text-lg font-semibold tracking-wide uppercase">
								Lunvia
							</span>
						</Link>

						{/* Dashboard Navigation inline with logo */}
						{showDashboardNav && (
							<div className="hidden md:flex items-center pl-4 border-l border-white/10">
								<DashboardNav />
							</div>
						)}
					</div>

					<div className="flex items-center gap-2 lg:gap-3">
						{isSignedIn ? (
							<>
								{/* Show "Upgrade to Pro" for Free users */}
								<Protect
									condition={(has) =>
										!has({ plan: "standard" }) && !has({ plan: "premium" })
									}
									fallback={null}
								>
									<Link href="/dashboard/upgrade">
										<Button
											className={`${primaryButtonClasses} bg-white text-black hover:bg-white/80`}
										>
											<Zap className="h-4 w-4" />
											<span className="hidden lg:inline">Upgrade to Pro</span>
											<span className="lg:hidden">Pro</span>
										</Button>
									</Link>
								</Protect>

								{/* Check whether the user own a standardplan */}
								<Protect
									condition={(has) =>
										has({ plan: "standard" }) && !has({ plan: "premium" })
									}
									fallback={null}
								>
									<Link href="/dashboard/upgrade">
										<Button
											className={`${primaryButtonClasses} bg-white text-black hover:bg-white/80`}
										>
											<Crown className="h-4 w-4" />
											<span className="hidden lg:inline">
												Upgrade to premium
											</span>
											<span className="lg:hidden">premium</span>
										</Button>
									</Link>
								</Protect>

								{/* Show premium badge for premium users */}
								<Protect
									condition={(has) => has({ plan: "premium" })}
									fallback={null}
								>
									<Badge className="hidden md:inline-flex gap-1.5 rounded-full border border-white/10 bg-white/0 px-3 py-1 text-xs uppercase tracking-wide text-white/80">
										<Crown className="h-3 w-3" />
										premium
									</Badge>
								</Protect>

								{!showDashboardNav && (
									<Link href="/dashboard/projects">
										<Button
											variant="ghost"
											size="sm"
											className="rounded-full border border-white/10 text-white hover:bg-white/5"
										>
											<span className="hidden lg:inline">My Projects</span>
											<span className="lg:hidden">Projects</span>
										</Button>
									</Link>
								)}
								{showDashboardNav && (
									<Link href="/" className="hidden lg:block">
										<Button
											variant="ghost"
											size="sm"
											className="gap-2 rounded-full border border-white/10 text-white hover:bg-white/5"
										>
											<Home className="h-4 w-4" />
											Home
										</Button>
									</Link>
								)}
								<div className="rounded-full border border-white/10 p-1">
									<UserButton afterSignOutUrl="/" />
								</div>
							</>
						) : (
							<SignInButton mode="modal">
								<Button
									className={`${primaryButtonClasses} bg-white text-black hover:bg-white/80`}
								>
									Sign In
								</Button>
							</SignInButton>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
