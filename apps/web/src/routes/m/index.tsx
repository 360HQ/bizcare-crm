import { env } from "@bizcare-crm/env/web";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { MemorialCard } from "@/components/public/memorial-card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/m/")({
	component: PublicSearchPage,
});

function PublicSearchPage() {
	const [search, setSearch] = useState("");
	const [categoryId, setCategoryId] = useState("");

	const orgId = env.VITE_PUBLIC_ORG_ID;

	const categories = useQuery(
		trpc.memorial.public.categories.queryOptions({ organizationId: orgId })
	);

	const results = useQuery(
		trpc.memorial.public.search.queryOptions({
			organizationId: orgId,
			query: search || undefined,
			categoryId: categoryId || undefined,
			limit: 30,
		})
	);

	return (
		<div className="mx-auto min-h-screen max-w-lg px-4 py-8">
			<div className="mb-8 text-center">
				<h1 className="font-serif text-3xl text-amber-950 dark:text-amber-100">
					BizCARE CRM
				</h1>
				<p className="mt-2 text-amber-700 text-sm dark:text-amber-400">
					Search for a memorial by name
				</p>
			</div>

			<div className="mb-6 space-y-3">
				<div className="relative">
					<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-amber-500" />
					<Input
						className="border-amber-200 bg-amber-50/50 pl-9 dark:border-amber-800 dark:bg-amber-950/30"
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by name..."
						value={search}
					/>
				</div>
				<Select
					onValueChange={(val) =>
						setCategoryId(val === "all" ? "" : (val ?? ""))
					}
					value={categoryId || "all"}
				>
					<SelectTrigger className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
						<SelectValue placeholder="All Categories" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Categories</SelectItem>
						{categories.data?.map((cat) => (
							<SelectItem key={cat.id} value={cat.id}>
								{cat.nameZh ?? cat.nameEn ?? "Untitled"}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-3">
				{(() => {
					if (results.isLoading) {
						return (
							<p className="py-12 text-center text-amber-600 text-sm dark:text-amber-400">
								Loading...
							</p>
						);
					}
					if (results.data?.items.length === 0) {
						return (
							<p className="py-12 text-center text-amber-600 text-sm dark:text-amber-400">
								No memorials found
							</p>
						);
					}
					return results.data?.items.map((item) => (
						<MemorialCard
							categoryName={item.categoryNameZh ?? item.categoryNameEn}
							key={item.id}
							location={item.location}
							nameEn={item.nameEn}
							nameZh={item.nameZh}
							photo={item.photo}
							slug={item.publicSlug}
						/>
					));
				})()}
			</div>
		</div>
	);
}
