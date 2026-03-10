import { createFileRoute, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
	component: HomeComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (session.data) {
			redirect({ to: "/dashboard", throw: true });
		}
	},
});

function HomeComponent() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
			<div className="text-center">
				<h1 className="font-bold text-4xl tracking-tight">BizCARE CRM</h1>
				<p className="mt-2 text-lg text-muted-foreground">
					Customizable CRM for care-based organizations
				</p>
			</div>
			<a
				className="rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
				href="/login"
			>
				Sign In to Get Started
			</a>
		</div>
	);
}
