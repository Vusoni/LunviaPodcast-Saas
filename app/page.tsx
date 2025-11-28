import { CtaSection } from "@/components/home/cta-section";
import { FeaturesSection } from "@/components/home/features-section";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { HeroSection } from "@/components/home/hero-section";
import { PricingSection } from "@/components/home/pricing-section";

export default function Home() {
	return (
		<div className="min-h-screen bg-black text-white">
			<Header />
			<main className="space-y-32 md:space-y-40">
				<HeroSection />
				<FeaturesSection />
				<PricingSection />
				<CtaSection />
			</main>
			<Footer />
		</div>
	);
}
