import { useState } from "react";

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

const FIELD_TYPES = [
	"text",
	"number",
	"date",
	"select",
	"multiselect",
	"boolean",
	"url",
] as const;

interface CustomFieldFormValues {
	entityType: string;
	fieldKey: string;
	fieldType: string;
	isRequired: boolean;
	labelEn: string;
	labelZh: string;
	moduleId: string;
	options: Array<{ labelEn: string; labelZh: string; value: string }>;
}

export function CustomFieldForm({
	onSubmit,
	submitting,
	moduleId,
}: {
	onSubmit: (values: CustomFieldFormValues) => void;
	submitting?: boolean;
	moduleId: string;
}) {
	const [values, setValues] = useState<CustomFieldFormValues>({
		moduleId,
		entityType: "record",
		fieldKey: "",
		labelEn: "",
		labelZh: "",
		fieldType: "text",
		isRequired: false,
		options: [],
	});

	function update<K extends keyof CustomFieldFormValues>(
		key: K,
		value: CustomFieldFormValues[K]
	) {
		setValues((prev) => ({ ...prev, [key]: value }));
	}

	const showOptions =
		values.fieldType === "select" || values.fieldType === "multiselect";

	function addOption() {
		update("options", [
			...values.options,
			{ value: "", labelEn: "", labelZh: "" },
		]);
	}

	function updateOption(
		index: number,
		field: "value" | "labelEn" | "labelZh",
		val: string
	) {
		const next = [...values.options];
		next[index] = { ...next[index], [field]: val };
		update("options", next);
	}

	function removeOption(index: number) {
		update(
			"options",
			values.options.filter((_, i) => i !== index)
		);
	}

	return (
		<form
			className="space-y-4"
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(values);
			}}
		>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1">
					<Label>Field Key</Label>
					<Input
						onChange={(e) => update("fieldKey", e.target.value)}
						placeholder="e.g. special_instructions"
						value={values.fieldKey}
					/>
					<p className="text-muted-foreground text-xs">
						Lowercase, underscores only
					</p>
				</div>
				<div className="space-y-1">
					<Label>Field Type</Label>
					<Select
						onValueChange={(val) => update("fieldType", val ?? "text")}
						value={values.fieldType}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{FIELD_TYPES.map((ft) => (
								<SelectItem key={ft} value={ft}>
									{ft}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1">
					<Label>Label (English)</Label>
					<Input
						onChange={(e) => update("labelEn", e.target.value)}
						value={values.labelEn}
					/>
				</div>
				<div className="space-y-1">
					<Label>Label (中文)</Label>
					<Input
						onChange={(e) => update("labelZh", e.target.value)}
						value={values.labelZh}
					/>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<input
					checked={values.isRequired}
					className="size-4"
					id="isRequired"
					onChange={(e) => update("isRequired", e.target.checked)}
					type="checkbox"
				/>
				<Label htmlFor="isRequired">Required</Label>
			</div>

			{showOptions && (
				<div className="space-y-2">
					<Label>Options</Label>
					{values.options.map((opt, i) => (
						<div className="flex gap-2" key={`option-${i.toString()}`}>
							<Input
								onChange={(e) => updateOption(i, "value", e.target.value)}
								placeholder="value"
								value={opt.value}
							/>
							<Input
								onChange={(e) => updateOption(i, "labelEn", e.target.value)}
								placeholder="English"
								value={opt.labelEn}
							/>
							<Input
								onChange={(e) => updateOption(i, "labelZh", e.target.value)}
								placeholder="中文"
								value={opt.labelZh}
							/>
							<Button
								onClick={() => removeOption(i)}
								size="icon"
								type="button"
								variant="ghost"
							>
								×
							</Button>
						</div>
					))}
					<Button onClick={addOption} size="sm" type="button" variant="outline">
						Add Option
					</Button>
				</div>
			)}

			<Button disabled={submitting} type="submit">
				{submitting ? "Creating..." : "Create Field"}
			</Button>
		</form>
	);
}
