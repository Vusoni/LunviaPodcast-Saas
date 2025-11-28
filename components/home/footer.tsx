export function Footer() {
	return (
		<footer className="px-4 pb-12 pt-24">
			<div className="container mx-auto">
				<div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="accent-text mb-3">Lunvia</p>
						<p className="text-white/60 max-w-md text-sm">
							Minimal software for podcasters who value speed, clarity, and a calm
							interface.
						</p>
					</div>
					<div className="flex gap-6 text-sm text-white/60">
						<a href="/dashboard/projects" className="hover:text-white transition-colors">
							Projects
						</a>
						<a href="/dashboard/upload" className="hover:text-white transition-colors">
							Upload
						</a>
						<a href="mailto:hello@lunvia.ai" className="hover:text-white transition-colors">
							Contact
						</a>
					</div>
				</div>

				<div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
					<p>{new Date().getFullYear()} Lunvia. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
