import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "./convex-provider";
import "./globals.css";

// Fonts
// import { Geist, Geist_Mono } from "next/font/google";

// const geistSans = Geist({
// 	variable: "--font-geist-sans",
// 	subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
// 	variable: "--font-geist-mono",
// 	subsets: ["latin"],
// });

// Sora Fonts
import { Sora } from "next/font/google";

export const sora = Sora({
	variable: "--font-sora",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "Lunvia – AI Podcast Assistant for Modern Creators",
	description:
		"Automate your podcast workflow with Lunvia. Instantly generate transcripts, summaries, social clips, and show notes using cutting-edge AI.",
	keywords: [
		"AI podcast assistant",
		"podcast automation",
		"AI transcripts",
		"AI show notes",
		"podcast summarizer",
		"content repurposing AI",
		"creator tools",
		"Lunvia",
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<ConvexClientProvider>
				<html lang="en">
					<body className={`${sora.variable} ${sora.variable} antialiased`}>
						{children}
						<Toaster />
					</body>
				</html>
			</ConvexClientProvider>
		</ClerkProvider>
	);
}
