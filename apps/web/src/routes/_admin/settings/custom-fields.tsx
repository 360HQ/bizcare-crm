import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CustomFieldForm } from "@/components/admin/custom-field-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { queryClient, trpc, trpcClient } from "@/utils/trpc";

export const Route = createFileRoute("/_admin/settings/custom-fields")({
	component: CustomFieldsPage,
});

function CustomFieldsPage() {
	const { t } = useTranslation();
	const [moduleId, setModuleId] = useState("memorial");

	const fields = useQuery(
		trpc.core.customField.list.queryOptions({ moduleId })
	);

	const createField = useMutation({
		mutationFn: (values: {
			moduleId: string;
			entityType: string;
			fieldKey: string;
			labelEn: string;
			labelZh: string;
			fieldType: string;
			isRequired: boolean;
			options: Array<{ value: string; labelEn: string; labelZh: string }>;
		}) =>
			trpcClient.core.customField.create.mutate({
				moduleId: values.moduleId,
				entityType: values.entityType,
				fieldKey: values.fieldKey,
				labelEn: values.labelEn || undefined,
				labelZh: values.labelZh || undefined,
				fieldType: values.fieldType as
					| "text"
					| "number"
					| "date"
					| "select"
					| "multiselect"
					| "boolean"
					| "url",
				isRequired: values.isRequired,
				options: values.options.length > 0 ? values.options : undefined,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [["core", "customField"]],
			});
			toast.success("Custom field created");
		},
		onError: (err) => toast.error(err.message),
	});

	const deleteField = useMutation({
		mutationFn: (id: string) =>
			trpcClient.core.customField.delete.mutate({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [["core", "customField"]],
			});
			toast.success("Custom field deleted");
		},
		onError: (err) => toast.error(err.message),
	});

	return (
		<div className="max-w-2xl space-y-6">
			<h1 className="font-semibold text-xl">Custom Fields</h1>
			<p className="text-muted-foreground text-sm">
				Define custom fields for each module. These will appear in forms and
				records automatically.
			</p>

			<div className="flex items-center gap-2">
				<span className="text-sm">Module:</span>
				<Select
					onValueChange={(val) => setModuleId(val ?? "memorial")}
					value={moduleId}
				>
					<SelectTrigger className="w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="memorial">{t("nav.memorials")}</SelectItem>
						<SelectItem value="contact">{t("nav.contacts")}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="rounded-md border p-4">
				<h2 className="mb-4 font-medium text-sm">Add Field</h2>
				<CustomFieldForm
					moduleId={moduleId}
					onSubmit={(values) => createField.mutate(values)}
					submitting={createField.isPending}
				/>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Key</TableHead>
							<TableHead>Label</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Required</TableHead>
							<TableHead />
						</TableRow>
					</TableHeader>
					<TableBody>
						{(() => {
							if (fields.isLoading) {
								return (
									<TableRow>
										<TableCell className="text-muted-foreground" colSpan={5}>
											{t("common.loading")}
										</TableCell>
									</TableRow>
								);
							}
							if (!fields.data?.length) {
								return (
									<TableRow>
										<TableCell className="text-muted-foreground" colSpan={5}>
											No custom fields defined
										</TableCell>
									</TableRow>
								);
							}
							return fields.data.map((field) => (
								<TableRow key={field.id}>
									<TableCell className="font-mono text-xs">
										{field.fieldKey}
									</TableCell>
									<TableCell>{field.labelEn ?? field.labelZh ?? "—"}</TableCell>
									<TableCell>
										<Badge variant="secondary">{field.fieldType}</Badge>
									</TableCell>
									<TableCell>{field.isRequired ? "Yes" : "No"}</TableCell>
									<TableCell>
										<Button
											onClick={() => deleteField.mutate(field.id)}
											size="icon"
											variant="ghost"
										>
											<Trash2 className="size-4" />
										</Button>
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
