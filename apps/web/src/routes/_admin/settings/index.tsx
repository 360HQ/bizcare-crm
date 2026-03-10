import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Settings2 } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "@/contexts/organization";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";

export const Route = createFileRoute("/_admin/settings/")({
	component: SettingsPage,
});

function SettingsPage() {
	const { currentOrg } = useOrganization();

	const orgQuery = useQuery(trpc.core.organization.get.queryOptions());

	const updateOrg = useMutation({
		mutationFn: (input: { name?: string }) =>
			trpcClient.core.organization.update.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [["core", "organization"]],
			});
			toast.success("Settings saved");
		},
		onError: (err) => toast.error(err.message),
	});

	const form = useForm({
		defaultValues: {
			name: orgQuery.data?.name ?? currentOrg?.name ?? "",
		},
		onSubmit: ({ value }) => updateOrg.mutate(value),
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, "Name is required"),
			}),
		},
	});

	return (
		<div className="max-w-lg space-y-6">
			<h1 className="font-semibold text-xl">Organization Settings</h1>

			<form
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<form.Field name="name">
					{(field) => (
						<div className="space-y-1">
							<Label htmlFor={field.name}>Organization Name</Label>
							<Input
								id={field.name}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								value={field.state.value}
							/>
						</div>
					)}
				</form.Field>

				<Button disabled={updateOrg.isPending} type="submit">
					{updateOrg.isPending ? "Saving..." : "Save Settings"}
				</Button>
			</form>

			<div className="space-y-2 border-t pt-4">
				<p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
					Advanced
				</p>
				<Link
					className="flex items-center gap-2 rounded-md border p-3 text-sm transition-colors hover:bg-muted"
					to="/settings/notifications"
				>
					<Bell className="size-4" />
					<div>
						<p className="font-medium">Notifications</p>
						<p className="text-muted-foreground text-xs">
							Configure automatic notification rules
						</p>
					</div>
				</Link>
				<Link
					className="flex items-center gap-2 rounded-md border p-3 text-sm transition-colors hover:bg-muted"
					to="/settings/custom-fields"
				>
					<Settings2 className="size-4" />
					<div>
						<p className="font-medium">Custom Fields</p>
						<p className="text-muted-foreground text-xs">
							Define custom fields for each module
						</p>
					</div>
				</Link>
			</div>
		</div>
	);
}
