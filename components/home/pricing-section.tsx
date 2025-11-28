import { PricingTable } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ComponentType } from "react";

interface PricingSectionProps {
	compact?: boolean;
}

type ClerkPricingTableProps = ComponentProps<typeof PricingTable>;
type PricingTableAppearance = ClerkPricingTableProps["appearance"];

const pricingAppearance = {
	variables: {
		colorPrimary: "#ffffff",
		colorBackground: "rgba(0,0,0,0.7)",
		colorText: "#f5f5f5",
	},
	elements: {
		pricingTable: {
			background: "transparent",
		},
		pricingTableCard: {
			backgroundColor: "#050505",
			border: "1px solid rgba(255,255,255,0.06)",
			borderRadius: "1.25rem",
			boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
		},
		pricingTableCardHeader: {
			backgroundColor: "#0a0a0a",
		},
		pricingTableCardButton: {
			borderRadius: "999px",
			border: "1px solid rgba(255,255,255,0.35)",
			backgroundColor: "rgba(10,10,10,0.85)",
			color: "#f5f5f5",
			boxShadow: "0 18px 35px rgba(0,0,0,0.65)",
			fontWeight: 700,
			textTransform: "uppercase",
			letterSpacing: "0.25em",
			padding: "0.85rem 2rem",
			backdropFilter: "blur(6px)",
		},
		pricingTableCardButton__hover: {
			transform: "translateY(-3px)",
			boxShadow: "0 25px 55px rgba(0,0,0,0.75)",
			borderColor: "rgba(126,245,162,0.6)",
			color: "#7ef5a2",
		},
		pricingTableCardFeature: {
			borderColor: "rgba(255,255,255,0.08)",
		},
	},
} satisfies PricingTableAppearance;

const PricingTableWithLayout = PricingTable as ComponentType<
	ClerkPricingTableProps & { layout?: "horizontal" | "vertical" }
>;

// Billing Component with Clerk Billings

export function PricingSection({ compact = false }: PricingSectionProps) {
	return (
		<section className="px-4 lg:px-10 py-16 md:py-24">
			<div className="container mx-auto space-y-12">
				<div className="flex flex-col gap-5 text-left">
					<p className="accent-text">Plans</p>
					<div className="flex flex-col gap-6 lg:flex-row lg:items-end">
						<h2 className="text-3xl md:text-5xl font-semibold flex-1 leading-tight text-balance">
							No confusing tiers—choose the runway your studio needs.
						</h2>
						<p className="text-white/60 max-w-xl text-base leading-relaxed">
							Upgrade or downgrade at any moment. Usage resets every billing
							cycle.
						</p>
					</div>
				</div>

				<div className="minimal-card surface-muted border-white/5 px-4 py-12 md:py-16">
					<div className="relative">
						<PricingTableWithLayout
							appearance={pricingAppearance}
							fallback={
								<div className="flex items-center justify-center py-16">
									<div className="text-center space-y-4">
										<Loader2 className="h-10 w-10 animate-spin text-white/60 mx-auto" />
										<p className="text-white/60 text-sm">
											Loading the latest pricing…
										</p>
									</div>
								</div>
							}
							layout={compact ? "horizontal" : "vertical"}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
