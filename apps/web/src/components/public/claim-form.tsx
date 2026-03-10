import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClaimValues {
	email: string;
	fullName: string;
	nric: string;
	phone: string;
	relationship: string;
}

function submitLabel(submitting?: boolean) {
	return submitting ? "Submitting..." : "Confirm & Submit";
}

export function ClaimForm({
	onSubmit,
	submitting,
}: {
	onSubmit: (values: ClaimValues) => void;
	submitting?: boolean;
}) {
	const [step, setStep] = useState(0);

	const form = useForm({
		defaultValues: {
			fullName: "",
			relationship: "",
			nric: "",
			phone: "",
			email: "",
		},
		onSubmit: ({ value }) => onSubmit(value),
		validators: {
			onSubmit: z.object({
				fullName: z.string().min(1, "Name is required"),
				relationship: z.string().min(1, "Relationship is required"),
				nric: z.string(),
				phone: z.string(),
				email: z.string(),
			}),
		},
	});

	return (
		<form
			className="space-y-6"
			onSubmit={(e) => {
				e.preventDefault();
				if (step === 0) {
					setStep(1);
				} else {
					form.handleSubmit();
				}
			}}
		>
			{step === 0 ? (
				<div className="space-y-4">
					<p className="text-amber-700 text-sm dark:text-amber-300">
						If you are a family member or descendant of the deceased, you may
						register your connection here.
					</p>
					<form.Field name="fullName">
						{(field) => (
							<div className="space-y-1">
								<Label htmlFor={field.name}>Your Full Name</Label>
								<Input
									id={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<p className="text-red-500 text-xs" key={error?.message}>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
					<form.Field name="relationship">
						{(field) => (
							<div className="space-y-1">
								<Label htmlFor={field.name}>Relationship</Label>
								<Input
									id={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g. Son, Daughter, Grandson"
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<p className="text-red-500 text-xs" key={error?.message}>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>
			) : (
				<div className="space-y-4">
					<p className="text-amber-700 text-sm dark:text-amber-300">
						Optional contact details for the temple to reach you.
					</p>
					<form.Field name="nric">
						{(field) => (
							<div className="space-y-1">
								<Label htmlFor={field.name}>NRIC (optional)</Label>
								<Input
									id={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									value={field.state.value}
								/>
							</div>
						)}
					</form.Field>
					<form.Field name="phone">
						{(field) => (
							<div className="space-y-1">
								<Label htmlFor={field.name}>Phone (optional)</Label>
								<Input
									id={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									value={field.state.value}
								/>
							</div>
						)}
					</form.Field>
					<form.Field name="email">
						{(field) => (
							<div className="space-y-1">
								<Label htmlFor={field.name}>Email (optional)</Label>
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
				</div>
			)}

			<div className="flex gap-2">
				{step === 1 && (
					<Button onClick={() => setStep(0)} type="button" variant="outline">
						Back
					</Button>
				)}
				<Button className="flex-1" disabled={submitting} type="submit">
					{step === 0 ? "Continue" : submitLabel(submitting)}
				</Button>
			</div>
		</form>
	);
}
