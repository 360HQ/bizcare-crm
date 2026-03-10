import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderOpen, Plus, Search } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_admin/memorials/")({
	component: MemorialsPage,
});

function MemorialsPage() {
	const { t } = useTranslation();
	const [search, setSearch] = useState("");
	const [categoryId, setCategoryId] = useState<string>("");

	const categories = useQuery(trpc.memorial.category.list.queryOptions());

	const memorials = useQuery(
		trpc.memorial.memorial.list.queryOptions({
			search: search || undefined,
			categoryId: categoryId || undefined,
			limit: 50,
		})
	);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-xl">{t("memorials.title")}</h1>
				<div className="flex gap-2">
					<Link to="/memorials/categories">
						<Button size="sm" variant="outline">
							<FolderOpen className="size-4" />
							{t("nav.categories")}
						</Button>
					</Link>
					<Link to="/memorials/new">
						<Button size="sm">
							<Plus className="size-4" />
							{t("memorials.add")}
						</Button>
					</Link>
				</div>
			</div>

			<div className="flex gap-2">
				<div className="relative max-w-sm flex-1">
					<Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="pl-8"
						onChange={(e) => setSearch(e.target.value)}
						placeholder={t("memorials.search")}
						value={search}
					/>
				</div>
				<Select
					onValueChange={(val) =>
						setCategoryId(val === "all" ? "" : (val ?? ""))
					}
					value={categoryId || "all"}
				>
					<SelectTrigger className="w-48">
						<SelectValue placeholder={t("memorials.category")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Categories</SelectItem>
						{categories.data?.map((cat) => (
							<SelectItem key={cat.id} value={cat.id}>
								{cat.nameEn ?? cat.nameZh ?? "Untitled"}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t("memorials.serialNumber")}</TableHead>
							<TableHead>{t("memorials.nameEn")}</TableHead>
							<TableHead>{t("memorials.nameZh")}</TableHead>
							<TableHead>{t("memorials.category")}</TableHead>
							<TableHead>{t("memorials.location")}</TableHead>
							<TableHead>{t("memorials.isPublic")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{(() => {
							if (memorials.isLoading) {
								return (
									<TableRow>
										<TableCell className="text-muted-foreground" colSpan={6}>
											{t("common.loading")}
										</TableCell>
									</TableRow>
								);
							}
							if (memorials.data?.items.length === 0) {
								return (
									<TableRow>
										<TableCell className="text-muted-foreground" colSpan={6}>
											{t("memorials.noMemorials")}
										</TableCell>
									</TableRow>
								);
							}
							return memorials.data?.items.map((m) => (
								<TableRow key={m.id}>
									<TableCell className="font-mono text-xs">
										{m.serialNumber ?? "—"}
									</TableCell>
									<TableCell>{m.nameEn ?? "—"}</TableCell>
									<TableCell>{m.nameZh ?? "—"}</TableCell>
									<TableCell>
										{m.categoryNameEn ?? m.categoryNameZh ?? "—"}
									</TableCell>
									<TableCell>{m.location ?? "—"}</TableCell>
									<TableCell>
										{m.isPublic ? (
											<Badge variant="default">Public</Badge>
										) : (
											<Badge variant="secondary">Private</Badge>
										)}
									</TableCell>
								</TableRow>
							));
						})()}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
