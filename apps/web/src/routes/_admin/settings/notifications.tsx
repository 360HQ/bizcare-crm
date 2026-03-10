import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { NotificationRuleForm } from "@/components/admin/notification-rule-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";

export const Route = createFileRoute("/_admin/settings/notifications")({
	component: NotificationsPage,
});

function NotificationsPage() {
	const rules = useQuery(trpc.core.notification.list.queryOptions());

	const createRule = useMutation({
		mutationFn: (values: {
			triggerEvent: string;
			channel: string;
			recipientType: string;
			messageTemplate: string;
		}) =>
			trpcClient.core.notification.create.mutate({
				triggerEvent: values.triggerEvent,
				channel: values.channel,
				recipientType: values.recipientType,
				messageTemplate: values.messageTemplate || undefined,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [["core", "notification"]],
			});
			toast.success("Notification rule created");
		},
		onError: (err) => toast.error(err.message),
	});

	const deleteRule = useMutation({
		mutationFn: (id: string) =>
			trpcClient.core.notification.delete.mutate({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [["core", "notification"]],
			});
			toast.success("Rule deleted");
		},
		onError: (err) => toast.error(err.message),
	});

	return (
		<div className="max-w-2xl space-y-6">
			<h1 className="font-semibold text-xl">Notification Rules</h1>
			<p className="text-muted-foreground text-sm">
				Configure automatic notifications when events occur in the system.
			</p>

			<div className="rounded-md border p-4">
				<h2 className="mb-4 font-medium text-sm">Add Rule</h2>
				<NotificationRuleForm
					onSubmit={(values) => createRule.mutate(values)}
					submitting={createRule.isPending}
				/>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Event</TableHead>
							<TableHead>Channel</TableHead>
							<TableHead>Recipient</TableHead>
							<TableHead>Status</TableHead>
							<TableHead />
						</TableRow>
					</TableHeader>
					<TableBody>
						{(() => {
							if (rules.isLoading) {
								return (
									<TableRow>
										<TableCell className="text-muted-foreground" colSpan={5}>
											Loading...
										</TableCell>
									</TableRow>
								);
							}
							if (!rules.data?.length) {
								return (
									<TableRow>
										<TableCell className="text-muted-foreground" colSpan={5}>
											No notification rules configured
										</TableCell>
									</TableRow>
								);
							}
							return rules.data.map((rule) => (
								<TableRow key={rule.id}>
									<TableCell className="font-mono text-xs">
										{rule.triggerEvent}
									</TableCell>
									<TableCell>{rule.channel}</TableCell>
									<TableCell>{rule.recipientType}</TableCell>
									<TableCell>
										{rule.isActive ? (
											<Badge variant="default">Active</Badge>
										) : (
											<Badge variant="secondary">Inactive</Badge>
										)}
									</TableCell>
									<TableCell>
										<Button
											onClick={() => deleteRule.mutate(rule.id)}
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
