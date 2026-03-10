import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Contact, LayoutDashboard, Settings } from "lucide-react";

import { useTranslation } from "@/lib/i18n";
import type { en } from "@/lib/translations/en";
import { cn } from "@/lib/utils";

const navItems = [
	{ to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
	{ to: "/contacts", labelKey: "nav.contacts", icon: Contact },
	{ to: "/memorials", labelKey: "nav.memorials", icon: BookOpen },

	{ to: "/settings", labelKey: "nav.settings", icon: Settings },
] as const satisfies ReadonlyArray<{
	to: string;
	labelKey: keyof typeof en;
	icon: typeof LayoutDashboard;
}>;

export function Sidebar({ className }: { className?: string }) {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const { t } = useTranslation();

	return (
		<nav
			className={cn(
				"flex flex-col gap-1 bg-sidebar p-3 text-sidebar-foreground",
				className
			)}
		>
			<div className="mb-4 px-2 font-semibold text-sm tracking-tight">
				BizCARE CRM
			</div>
			{navItems.map(({ to, labelKey, icon: Icon }) => {
				const isActive = currentPath.startsWith(to);
				return (
					<Link
						className={cn(
							"flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
							isActive &&
								"bg-sidebar-accent font-medium text-sidebar-accent-foreground"
						)}
						key={to}
						to={to}
					>
						<Icon className="size-4" />
						{t(labelKey)}
					</Link>
				);
			})}
		</nav>
	);
}
