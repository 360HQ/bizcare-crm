import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";

interface FieldDefinition {
	fieldKey: string;
	fieldType: string;
	id: string;
	isRequired: boolean;
	labelEn: string | null;
	labelZh: string | null;
	options: Array<{ value: string; labelEn: string; labelZh: string }> | null;
}

export function CustomFieldRenderer({
	fields,
	values,
	onChange,
}: {
	fields: FieldDefinition[];
	values: Record<string, unknown>;
	onChange: (key: string, value: unknown) => void;
}) {
	const { locale } = useTranslation();

	if (fields.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
				Custom Fields
			</p>
			{fields.map((field) => {
				const label =
					locale === "zh"
						? (field.labelZh ?? field.labelEn ?? field.fieldKey)
						: (field.labelEn ?? field.labelZh ?? field.fieldKey);

				return (
					<CustomField
						field={field}
						key={field.id}
						label={label}
						locale={locale}
						onChange={(val) => onChange(field.fieldKey, val)}
						value={values[field.fieldKey]}
					/>
				);
			})}
		</div>
	);
}

function CustomField({
	field,
	label,
	value,
	onChange,
	locale,
}: {
	field: FieldDefinition;
	label: string;
	value: unknown;
	onChange: (value: unknown) => void;
	locale: string;
}) {
	switch (field.fieldType) {
		case "text":
		case "url":
			return (
				<div className="space-y-1">
					<Label>{label}</Label>
					<Input
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.fieldType === "url" ? "https://..." : undefined}
						required={field.isRequired}
						type={field.fieldType === "url" ? "url" : "text"}
						value={String(value ?? "")}
					/>
				</div>
			);

		case "number":
			return (
				<div className="space-y-1">
					<Label>{label}</Label>
					<Input
						onChange={(e) => onChange(Number(e.target.value))}
						required={field.isRequired}
						type="number"
						value={String(value ?? "")}
					/>
				</div>
			);

		case "date":
			return (
				<div className="space-y-1">
					<Label>{label}</Label>
					<Input
						onChange={(e) => onChange(e.target.value)}
						required={field.isRequired}
						type="date"
						value={String(value ?? "")}
					/>
				</div>
			);

		case "boolean":
			return (
				<div className="flex items-center gap-2">
					<input
						checked={Boolean(value)}
						className="size-4"
						id={field.fieldKey}
						onChange={(e) => onChange(e.target.checked)}
						type="checkbox"
					/>
					<Label htmlFor={field.fieldKey}>{label}</Label>
				</div>
			);

		case "select":
			return (
				<div className="space-y-1">
					<Label>{label}</Label>
					<Select
						onValueChange={(val) =>
							onChange(val === "__none__" ? "" : (val ?? ""))
						}
						value={String(value ?? "") || "__none__"}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="__none__">— Select —</SelectItem>
							{field.options?.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{locale === "zh" ? opt.labelZh : opt.labelEn}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			);

		case "multiselect": {
			const selected = Array.isArray(value) ? (value as string[]) : [];
			return (
				<div className="space-y-1">
					<Label>{label}</Label>
					<div className="flex flex-wrap gap-2">
						{field.options?.map((opt) => {
							const isChecked = selected.includes(opt.value);
							return (
								<label
									className="flex items-center gap-1 text-sm"
									key={opt.value}
								>
									<input
										checked={isChecked}
										onChange={() => {
											const next = isChecked
												? selected.filter((v) => v !== opt.value)
												: [...selected, opt.value];
											onChange(next);
										}}
										type="checkbox"
									/>
									{locale === "zh" ? opt.labelZh : opt.labelEn}
								</label>
							);
						})}
					</div>
				</div>
			);
		}

		default:
			return null;
	}
}
