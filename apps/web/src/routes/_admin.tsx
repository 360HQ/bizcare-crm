import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { ErrorBoundary } from "@/components/error-boundary";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_admin")({
	component: AdminLayout,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		return { session };
	},
});

function AdminLayout() {
	return (
		<main className="mx-auto w-full max-w-6xl flex-1 overflow-auto p-6">
			<ErrorBoundary>
				<Outlet />
			</ErrorBoundary>
		</main>
	);
}
