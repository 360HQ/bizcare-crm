import { useForm } from "@tanstack/react-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactFormValues {
	email?: string | null;
	gender?: string | null;
	nameEn?: string | null;
	nameZh?: string | null;
	phone?: string | null;
	type?: "individual" | "organization";
}

export function ContactForm({
	onSubmit,
	submitting,
	defaultValues,
}: {
	onSubmit: (values: ContactFormValues) => void;
	submitting?: boolean;
	defaultValues?: Partial<ContactFormValues>;
}) {
	const form = useForm({
		defaultValues: {
			nameEn: defaultValues?.nameEn ?? "",
			nameZh: defaultValues?.nameZh ?? "",
			email: defaultValues?.email ?? "",
			phone: defaultValues?.phone ?? "",
			gender: defaultValues?.gender ?? "",
			type: defaultValues?.type ?? "individual",
		},
		onSubmit: ({ value }) => {
			onSubmit({
				nameEn: value.nameEn || null,
				nameZh: value.nameZh || null,
				email: value.email || null,
				phone: value.phone || null,
				gender: value.gender || null,
				type: (value.type || "individual") as "individual" | "organization",
			});
		},
		validators: {
			onSubmit: z.object({
				nameEn: z.string(),
				nameZh: z.string(),
				email: z.string(),
				phone: z.string(),
				gender: z.string(),
				type: z.enum(["individual", "organization"]),
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
			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="nameEn">
					{(field) => (
						<div className="space-y-1">
							<Label htmlFor={field.name}>Name (English)</Label>
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
							<Label htmlFor={field.name}>Name (中文)</Label>
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

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="email">
					{(field) => (
						<div className="space-y-1">
							<Label htmlFor={field.name}>Email</Label>
							<Input
								id={field.name}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								type="email"
								value={field.state.value}
							/>
						</div>
					)}
				</form.Field>
				<form.Field name="phone">
					{(field) => (
						<div className="space-y-1">
							<Label htmlFor={field.name}>Phone</Label>
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

			<Button className="w-full" disabled={submitting} type="submit">
				{submitting ? "Saving..." : "Save"}
			</Button>
		</form>
	);
}
