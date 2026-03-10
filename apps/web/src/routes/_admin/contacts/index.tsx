import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ContactForm } from "@/components/contact/contact-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";

export const Route = createFileRoute("/_admin/contacts/")({
	component: ContactsPage,
});

function ContactsPage() {
	const [search, setSearch] = useState("");
	const [showCreate, setShowCreate] = useState(false);

	const contacts = useQuery(
		trpc.core.contact.list.queryOptions({
			search: search || undefined,
			limit: 50,
		})
	);

	const createContact = useMutation({
		mutationFn: (input: {
			nameEn?: string | null;
			nameZh?: string | null;
			email?: string | null;
			phone?: string | null;
			gender?: string | null;
			type?: "individual" | "organization";
		}) => trpcClient.core.contact.create.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [["core", "contact", "list"]],
			});
			setShowCreate(false);
			toast.success("Contact created");
		},
		onError: (err) => toast.error(err.message),
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-xl">Contacts</h1>
				<Button onClick={() => setShowCreate(true)} size="sm">
					<Plus className="size-4" />
					Add Contact
				</Button>
			</div>

			<div className="relative max-w-sm">
				<Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					className="pl-8"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search contacts..."
					value={search}
				/>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name (EN)</TableHead>
							<TableHead>Name (ZH)</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone</TableHead>
							<TableHead>Type</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{(() => {
							if (contacts.isLoading) {
								return (
									<TableRow>
										<TableCell className="text-muted-foreground" colSpan={5}>
											Loading...
										</TableCell>
									</TableRow>
								);
							}
							if (contacts.data?.items.length === 0) {
								return (
									<TableRow>
										<TableCell className="text-muted-foreground" colSpan={5}>
											No contacts found
										</TableCell>
									</TableRow>
								);
							}
							return contacts.data?.items.map((c) => (
								<TableRow key={c.id}>
									<TableCell>{c.nameEn ?? "—"}</TableCell>
									<TableCell>{c.nameZh ?? "—"}</TableCell>
									<TableCell>{c.email ?? "—"}</TableCell>
									<TableCell>{c.phone ?? "—"}</TableCell>
									<TableCell className="capitalize">{c.type}</TableCell>
								</TableRow>
							));
						})()}
					</TableBody>
				</Table>
			</div>

			<Dialog onOpenChange={setShowCreate} open={showCreate}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Contact</DialogTitle>
					</DialogHeader>
					<ContactForm
						onSubmit={(values) => createContact.mutate(values)}
						submitting={createContact.isPending}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
