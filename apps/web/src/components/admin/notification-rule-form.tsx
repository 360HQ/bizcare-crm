import { useForm } from "@tanstack/react-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const TRIGGER_EVENTS = [
	{ value: "record.created", label: "Record Created" },
	{ value: "record.updated", label: "Record Updated" },
	{ value: "memorial.created", label: "Memorial Created" },
	{ value: "memorial.claim_submitted", label: "Claim Submitted" },
	{ value: "contact.created", label: "Contact Created" },
] as const;

const CHANNELS = [
	{ value: "in_app", label: "In-App" },
	{ value: "email", label: "Email (coming soon)" },
] as const;

const RECIPIENT_TYPES = [
	{ value: "all_admins", label: "All Admins" },
	{ value: "specific_user", label: "Specific User" },
] as const;

export function NotificationRuleForm({
	onSubmit,
	submitting,
}: {
	onSubmit: (values: {
		triggerEvent: string;
		channel: string;
		recipientType: string;
		messageTemplate: string;
	}) => void;
	submitting?: boolean;
}) {
	const form = useForm({
		defaultValues: {
			triggerEvent: "",
			channel: "in_app",
			recipientType: "all_admins",
			messageTemplate: "",
		},
		onSubmit: ({ value }) => onSubmit(value),
		validators: {
			onSubmit: z.object({
				triggerEvent: z.string().min(1, "Event is required"),
				channel: z.string().min(1),
				recipientType: z.string().min(1),
				messageTemplate: z.string(),
			}),
		},
	});

	return (
		<form
			className="space-y-4"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.Field name="triggerEvent">
				{(field) => (
					<div className="space-y-1">
						<Label>Trigger Event</Label>
						<Select
							onValueChange={(val) => field.handleChange(val ?? "")}
							value={field.state.value}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select event..." />
							</SelectTrigger>
							<SelectContent>
								{TRIGGER_EVENTS.map((evt) => (
									<SelectItem key={evt.value} value={evt.value}>
										{evt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</form.Field>

			<form.Field name="channel">
				{(field) => (
					<div className="space-y-1">
						<Label>Channel</Label>
						<Select
							onValueChange={(val) => field.handleChange(val ?? "in_app")}
							value={field.state.value}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{CHANNELS.map((ch) => (
									<SelectItem key={ch.value} value={ch.value}>
										{ch.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</form.Field>

			<form.Field name="recipientType">
				{(field) => (
					<div className="space-y-1">
						<Label>Recipient</Label>
						<Select
							onValueChange={(val) => field.handleChange(val ?? "all_admins")}
							value={field.state.value}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{RECIPIENT_TYPES.map((rt) => (
									<SelectItem key={rt.value} value={rt.value}>
										{rt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</form.Field>

			<form.Field name="messageTemplate">
				{(field) => (
					<div className="space-y-1">
						<Label>Message Template (optional)</Label>
						<Input
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="e.g. A new claim has been submitted"
							value={field.state.value}
						/>
					</div>
				)}
			</form.Field>

			<Button disabled={submitting} type="submit">
				{submitting ? "Creating..." : "Create Rule"}
			</Button>
		</form>
	);
}
