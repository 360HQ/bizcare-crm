import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Contact, Plus, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOrganization } from "@/contexts/organization";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_admin/dashboard")({
	component: DashboardPage,
});

function StatCard({
	label,
	value,
	loading,
	icon: Icon,
}: {
	label: string;
	value: string | number;
	loading?: boolean;
	icon?: typeof BookOpen;
}) {
	return (
		<div className="rounded-lg border bg-card p-4 text-card-foreground">
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-sm">{label}</p>
				{Icon && <Icon className="size-4 text-muted-foreground" />}
			</div>
			<p className="mt-1 font-semibold text-2xl">{loading ? "..." : value}</p>
		</div>
	);
}

function DashboardPage() {
	const { currentOrg } = useOrganization();

	const contacts = useQuery(
		trpc.core.contact.list.queryOptions({ limit: 100 })
	);
	const memorials = useQuery(
		trpc.memorial.memorial.list.queryOptions({ limit: 100 })
	);
	const categories = useQuery(trpc.memorial.category.list.queryOptions());
	const recentActivity = useQuery(
		trpc.core.activity.recent.queryOptions({ limit: 8 })
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-semibold text-xl">
						{currentOrg?.name ?? "Dashboard"}
					</h1>
					<p className="text-muted-foreground text-sm">
						Welcome to your CRM dashboard
					</p>
				</div>
				<div className="flex gap-2">
					<Link to="/memorials/new">
						<Button size="sm">
							<Plus className="size-4" />
							New Memorial
						</Button>
					</Link>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					icon={Contact}
					label="Contacts"
					loading={contacts.isLoading}
					value={contacts.data?.items.length ?? 0}
				/>
				<StatCard
					icon={BookOpen}
					label="Memorials"
					loading={memorials.isLoading}
					value={memorials.data?.items.length ?? 0}
				/>
				<StatCard
					icon={UserPlus}
					label="Categories"
					loading={categories.isLoading}
					value={categories.data?.length ?? 0}
				/>
				<StatCard
					label="Recent Activity"
					loading={recentActivity.isLoading}
					value={recentActivity.data?.length ?? 0}
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<section>
					<h2 className="mb-3 font-medium text-sm">Recent Activity</h2>
					<div className="rounded-md border">
						{(() => {
							if (recentActivity.isLoading) {
								return (
									<p className="p-4 text-muted-foreground text-sm">
										Loading...
									</p>
								);
							}
							if ((recentActivity.data?.length ?? 0) === 0) {
								return (
									<p className="p-4 text-muted-foreground text-sm">
										No recent activity
									</p>
								);
							}
							return (
								<ul className="divide-y">
									{recentActivity.data?.map((item) => (
										<li
											className="flex items-center gap-3 px-4 py-2.5 text-sm"
											key={item.id}
										>
											<span className="shrink-0 font-mono text-muted-foreground text-xs">
												{new Date(item.createdAt).toLocaleDateString()}
											</span>
											<span className="truncate">
												{item.description ?? item.type}
											</span>
										</li>
									))}
								</ul>
							);
						})()}
					</div>
				</section>

				<section>
					<h2 className="mb-3 font-medium text-sm">Quick Actions</h2>
					<div className="grid gap-2">
						<Link
							className="flex items-center gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-muted"
							to="/memorials/new"
						>
							<Plus className="size-4 text-muted-foreground" />
							<div>
								<p className="font-medium">Add Memorial</p>
								<p className="text-muted-foreground text-xs">
									Register a new memorial record
								</p>
							</div>
						</Link>
						<Link
							className="flex items-center gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-muted"
							to="/contacts"
						>
							<UserPlus className="size-4 text-muted-foreground" />
							<div>
								<p className="font-medium">Manage Contacts</p>
								<p className="text-muted-foreground text-xs">
									View and add family contacts
								</p>
							</div>
						</Link>
						<Link
							className="flex items-center gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-muted"
							to="/memorials/categories"
						>
							<BookOpen className="size-4 text-muted-foreground" />
							<div>
								<p className="font-medium">Memorial Categories</p>
								<p className="text-muted-foreground text-xs">
									Configure categories and locations
								</p>
							</div>
						</Link>
					</div>
				</section>
			</div>
		</div>
	);
}
