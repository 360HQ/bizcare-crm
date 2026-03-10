import { Link, useRouterState } from "@tanstack/react-router";
import {
	BookOpen,
	Contact,
	LayoutDashboard,
	Menu,
	Settings,
} from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { OrgSwitcher } from "./admin/org-switcher";
import { LocaleToggle } from "./locale-toggle";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";
import UserMenu from "./user-menu";

const adminNav = [
	{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ to: "/contacts", label: "Contacts", icon: Contact },
	{ to: "/memorials", label: "Memorials", icon: BookOpen },
	{ to: "/settings", label: "Settings", icon: Settings },
] as const;

export default function Header() {
	const { data: session } = authClient.useSession();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const isPublicRoute =
		currentPath === "/" ||
		currentPath === "/login" ||
		currentPath.startsWith("/m/") ||
		currentPath === "/m";

	return (
		<div>
			<div className="flex items-center justify-between px-3 py-2">
				<div className="flex items-center gap-3">
					{session && !isPublicRoute && (
						<MobileMenu currentPath={currentPath} />
					)}
					<Link className="font-semibold text-sm tracking-tight" to="/">
						BizCARE CRM
					</Link>
					{session && !isPublicRoute && (
						<nav className="hidden items-center gap-1 md:flex">
							{adminNav.map(({ to, label }) => (
								<Link
									className={cn(
										"rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent",
										currentPath.startsWith(to) &&
											"bg-accent font-medium text-accent-foreground"
									)}
									key={to}
									to={to}
								>
									{label}
								</Link>
							))}
						</nav>
					)}
				</div>
				<div className="flex items-center gap-2">
					{session && <OrgSwitcher />}
					<LocaleToggle />
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
			<hr />
		</div>
	);
}

function MobileMenu({ currentPath }: { currentPath: string }) {
	const [open, setOpen] = useState(false);

	return (
		<Sheet onOpenChange={setOpen} open={open}>
			<SheetTrigger
				render={
					<Button className="md:hidden" size="icon" variant="ghost">
						<Menu className="size-5" />
						<span className="sr-only">Menu</span>
					</Button>
				}
			/>
			<SheetContent side="left">
				<SheetHeader>
					<SheetTitle>Navigation</SheetTitle>
				</SheetHeader>
				<nav className="mt-4 flex flex-col gap-1">
					{adminNav.map(({ to, label, icon: Icon }) => (
						<Link
							className={cn(
								"flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
								currentPath.startsWith(to) &&
									"bg-accent font-medium text-accent-foreground"
							)}
							key={to}
							onClick={() => setOpen(false)}
							to={to}
						>
							<Icon className="size-4" />
							{label}
						</Link>
					))}
				</nav>
			</SheetContent>
		</Sheet>
	);
}
