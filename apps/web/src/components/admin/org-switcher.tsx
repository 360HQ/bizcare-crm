import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "@/contexts/organization";
import { queryClient, trpcClient } from "@/utils/trpc";

export function OrgSwitcher() {
	const { organizations, currentOrg, setOrganizationId, isLoading } =
		useOrganization();
	const [showCreate, setShowCreate] = useState(false);

	const createOrg = useMutation({
		mutationFn: (input: { name: string; slug: string }) =>
			trpcClient.core.organization.create.mutate(input),
		onSuccess: (data) => {
			setOrganizationId(data.id);
			queryClient.invalidateQueries({
				queryKey: [["core", "organization", "list"]],
			});
			setShowCreate(false);
			toast.success("Organization created");
		},
		onError: (err) => toast.error(err.message),
	});

	const form = useForm({
		defaultValues: { name: "", slug: "" },
		onSubmit: ({ value }) => createOrg.mutate(value),
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, "Name is required"),
				slug: z
					.string()
					.min(1, "Slug is required")
					.regex(SLUG_PATTERN, "Lowercase letters, numbers, hyphens only"),
			}),
		},
	});

	if (isLoading) {
		return (
			<Button disabled size="sm" variant="outline">
				<Building2 className="size-4" />
				Loading...
			</Button>
		);
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
					<Building2 className="size-4" />
					{currentOrg?.name ?? "Select organization"}
				</DropdownMenuTrigger>
				<DropdownMenuContent className="bg-card">
					<DropdownMenuLabel>Organizations</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{organizations.map((org) => (
						<DropdownMenuItem
							key={org.id}
							onClick={() => setOrganizationId(org.id)}
						>
							{org.name}
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setShowCreate(true)}>
						<Plus className="size-4" />
						Create Organization
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog onOpenChange={setShowCreate} open={showCreate}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Organization</DialogTitle>
						<DialogDescription>
							Set up a new organization to manage your records.
						</DialogDescription>
					</DialogHeader>
					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<form.Field name="name">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Name</Label>
									<Input
										id={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="My Temple"
										value={field.state.value}
									/>
									{field.state.meta.errors.map((error) => (
										<p
											className="text-destructive text-xs"
											key={error?.message}
										>
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
						<form.Field name="slug">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Slug</Label>
									<Input
										id={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="my-temple"
										value={field.state.value}
									/>
									{field.state.meta.errors.map((error) => (
										<p
											className="text-destructive text-xs"
											key={error?.message}
										>
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
						<DialogFooter>
							<DialogClose render={<Button variant="outline" />}>
								Cancel
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
										{state.isSubmitting ? "Creating..." : "Create"}
									</Button>
								)}
							</form.Subscribe>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
