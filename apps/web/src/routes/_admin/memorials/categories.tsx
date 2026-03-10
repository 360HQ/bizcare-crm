import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";

export const Route = createFileRoute("/_admin/memorials/categories")({
	component: CategoriesPage,
});

function CategoriesPage() {
	const { t } = useTranslation();
	const [showCreate, setShowCreate] = useState(false);

	const categories = useQuery(trpc.memorial.category.list.queryOptions());

	const createCategory = useMutation({
		mutationFn: (input: {
			nameEn?: string | null;
			nameZh?: string | null;
			locationFormat?: string | null;
			position?: number;
		}) => trpcClient.memorial.category.create.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [["memorial", "category", "list"]],
			});
			setShowCreate(false);
			toast.success(t("categories.created"));
		},
		onError: (err) => toast.error(err.message),
	});

	const deleteCategory = useMutation({
		mutationFn: (id: string) =>
			trpcClient.memorial.category.delete.mutate({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [["memorial", "category", "list"]],
			});
			toast.success(t("categories.deleted"));
		},
		onError: (err) => toast.error(err.message),
	});

	const form = useForm({
		defaultValues: { nameEn: "", nameZh: "", locationFormat: "" },
		onSubmit: ({ value }) =>
			createCategory.mutate({
				nameEn: value.nameEn || null,
				nameZh: value.nameZh || null,
				locationFormat: value.locationFormat || null,
			}),
		validators: {
			onSubmit: z.object({
				nameEn: z.string(),
				nameZh: z.string(),
				locationFormat: z.string(),
			}),
		},
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-xl">{t("categories.title")}</h1>
				<Button onClick={() => setShowCreate(true)} size="sm">
					<Plus className="size-4" />
					{t("categories.add")}
				</Button>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t("categories.position")}</TableHead>
							<TableHead>{t("categories.nameEn")}</TableHead>
							<TableHead>{t("categories.nameZh")}</TableHead>
							<TableHead>{t("categories.locationFormat")}</TableHead>
							<TableHead>{t("common.actions")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{(() => {
							if (categories.isLoading) {
								return (
									<TableRow>
										<TableCell className="text-muted-foreground" colSpan={5}>
											{t("common.loading")}
										</TableCell>
									</TableRow>
								);
							}
							if (categories.data?.length === 0) {
								return (
									<TableRow>
										<TableCell className="text-muted-foreground" colSpan={5}>
											{t("categories.noCategories")}
										</TableCell>
									</TableRow>
								);
							}
							return categories.data?.map((cat) => (
								<TableRow key={cat.id}>
									<TableCell>{cat.position}</TableCell>
									<TableCell>{cat.nameEn ?? "—"}</TableCell>
									<TableCell>{cat.nameZh ?? "—"}</TableCell>
									<TableCell className="font-mono text-xs">
										{cat.locationFormat ?? "—"}
									</TableCell>
									<TableCell>
										<Button
											onClick={() => deleteCategory.mutate(cat.id)}
											size="icon-xs"
											variant="ghost"
										>
											<Trash2 className="size-3.5" />
										</Button>
									</TableCell>
								</TableRow>
							));
						})()}
					</TableBody>
				</Table>
			</div>

			<Dialog onOpenChange={setShowCreate} open={showCreate}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("categories.add")}</DialogTitle>
					</DialogHeader>
					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<form.Field name="nameEn">
								{(field) => (
									<div className="space-y-1">
										<Label htmlFor={field.name}>{t("categories.nameEn")}</Label>
										<Input
											id={field.name}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											value={field.state.value}
										/>
									</div>
								)}
							</form.Field>
							<form.Field name="nameZh">
								{(field) => (
									<div className="space-y-1">
										<Label htmlFor={field.name}>{t("categories.nameZh")}</Label>
										<Input
											id={field.name}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											value={field.state.value}
										/>
									</div>
								)}
							</form.Field>
						</div>
						<form.Field name="locationFormat">
							{(field) => (
								<div className="space-y-1">
									<Label htmlFor={field.name}>
										{t("categories.locationFormat")}
									</Label>
									<Input
										id={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g. Building-Floor-Row-Column"
										value={field.state.value}
									/>
								</div>
							)}
						</form.Field>
						<DialogFooter>
							<DialogClose render={<Button variant="outline" />}>
								{t("common.cancel")}
							</DialogClose>
							<form.Subscribe
								selector={(state) => ({
									canSubmit: state.canSubmit,
									isSubmitting: state.isSubmitting,
								})}
							>
								{(state) => (
									<Button
										disabled={!state.canSubmit || state.isSubmitting}
										type="submit"
									>
										{state.isSubmitting
											? t("common.loading")
											: t("common.create")}
									</Button>
								)}
							</form.Subscribe>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
