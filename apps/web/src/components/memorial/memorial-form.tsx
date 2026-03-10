import { useQuery } from "@tanstack/react-query";
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
import { useTranslation } from "@/lib/i18n";
import { trpc } from "@/utils/trpc";

interface MemorialFormValues {
	categoryId?: string | null;
	dateOfBirth?: string | null;
	dateOfBirthLunar?: string | null;
	dateOfDeath?: string | null;
	dateOfDeathLunar?: string | null;
	familyOrigin?: string | null;
	gender?: string | null;
	internmentStatus?: string | null;
	isPublic: boolean;
	location?: string | null;
	memorialServiceDate?: string | null;
	nameEn?: string | null;
	nameZh?: string | null;
	nric?: string | null;
	photo?: string | null;
	serialNumber?: string | null;
}

const STEPS = [
	"memorials.step.deceased",
	"memorials.step.details",
	"memorials.step.category",
	"memorials.step.review",
] as const;

function buildInitialValues(
	defaultValues?: Partial<MemorialFormValues>
): MemorialFormValues {
	return {
		nameEn: defaultValues?.nameEn ?? "",
		nameZh: defaultValues?.nameZh ?? "",
		gender: defaultValues?.gender ?? "",
		nric: defaultValues?.nric ?? "",
		dateOfBirth: defaultValues?.dateOfBirth ?? "",
		dateOfBirthLunar: defaultValues?.dateOfBirthLunar ?? "",
		dateOfDeath: defaultValues?.dateOfDeath ?? "",
		dateOfDeathLunar: defaultValues?.dateOfDeathLunar ?? "",
		familyOrigin: defaultValues?.familyOrigin ?? "",
		serialNumber: defaultValues?.serialNumber ?? "",
		location: defaultValues?.location ?? "",
		categoryId: defaultValues?.categoryId ?? "",
		internmentStatus: defaultValues?.internmentStatus ?? "",
		memorialServiceDate: defaultValues?.memorialServiceDate ?? "",
		photo: defaultValues?.photo ?? "",
		isPublic: defaultValues?.isPublic ?? false,
	};
}

function toSubmitValues(values: MemorialFormValues): MemorialFormValues {
	return {
		nameEn: values.nameEn || null,
		nameZh: values.nameZh || null,
		gender: values.gender || null,
		nric: values.nric || null,
		dateOfBirth: values.dateOfBirth || null,
		dateOfBirthLunar: values.dateOfBirthLunar || null,
		dateOfDeath: values.dateOfDeath || null,
		dateOfDeathLunar: values.dateOfDeathLunar || null,
		familyOrigin: values.familyOrigin || null,
		serialNumber: values.serialNumber || null,
		location: values.location || null,
		categoryId: values.categoryId || null,
		internmentStatus: values.internmentStatus || null,
		memorialServiceDate: values.memorialServiceDate || null,
		photo: values.photo || null,
		isPublic: values.isPublic,
	};
}

export function MemorialForm({
	onSubmit,
	submitting,
	defaultValues,
}: {
	onSubmit: (values: MemorialFormValues) => void;
	submitting?: boolean;
	defaultValues?: Partial<MemorialFormValues>;
}) {
	const { t } = useTranslation();
	const [step, setStep] = useState(0);
	const [values, setValues] = useState<MemorialFormValues>(() =>
		buildInitialValues(defaultValues)
	);

	const categories = useQuery(trpc.memorial.category.list.queryOptions());

	function update(field: keyof MemorialFormValues, value: string | boolean) {
		setValues((prev) => ({ ...prev, [field]: value }));
	}

	function handleSubmit() {
		onSubmit(toSubmitValues(values));
	}

	return (
		<div className="space-y-6">
			<StepIndicator currentStep={step} onStepClick={setStep} t={t} />

			{step === 0 && <StepDeceased t={t} update={update} values={values} />}
			{step === 1 && <StepDetails t={t} update={update} values={values} />}
			{step === 2 && (
				<StepCategory
					categories={categories.data ?? []}
					t={t}
					update={update}
					values={values}
				/>
			)}
			{step === 3 && <StepReview t={t} values={values} />}

			<FormNavigation
				onNext={() => setStep((s) => s + 1)}
				onPrev={() => setStep((s) => s - 1)}
				onSubmit={handleSubmit}
				step={step}
				submitting={submitting}
				t={t}
			/>
		</div>
	);
}

interface StepProps {
	t: ReturnType<typeof useTranslation>["t"];
	update: (field: keyof MemorialFormValues, value: string | boolean) => void;
	values: MemorialFormValues;
}

function StepIndicator({
	currentStep,
	onStepClick,
	t,
}: {
	currentStep: number;
	onStepClick: (step: number) => void;
	t: ReturnType<typeof useTranslation>["t"];
}) {
	return (
		<div className="flex gap-1">
			{STEPS.map((stepKey, i) => {
				let stepStyle = "border-border text-muted-foreground";
				if (i === currentStep) {
					stepStyle = "border-primary font-medium text-foreground";
				} else if (i < currentStep) {
					stepStyle = "border-primary/30 text-muted-foreground";
				}
				return (
					<button
						className={`flex-1 border-b-2 pb-2 text-center text-xs transition-colors ${stepStyle}`}
						key={stepKey}
						onClick={() => onStepClick(i)}
						type="button"
					>
						{t(stepKey)}
					</button>
				);
			})}
		</div>
	);
}

function FormNavigation({
	step,
	onPrev,
	onNext,
	onSubmit,
	submitting,
	t,
}: {
	step: number;
	onPrev: () => void;
	onNext: () => void;
	onSubmit: () => void;
	submitting?: boolean;
	t: ReturnType<typeof useTranslation>["t"];
}) {
	return (
		<div className="flex justify-between">
			<Button disabled={step === 0} onClick={onPrev} variant="outline">
				{t("common.previous")}
			</Button>
			{step < 3 ? (
				<Button onClick={onNext}>{t("common.next")}</Button>
			) : (
				<Button disabled={submitting} onClick={onSubmit}>
					{submitting ? t("common.loading") : t("common.confirm")}
				</Button>
			)}
		</div>
	);
}

function StepDeceased({ values, update, t }: StepProps) {
	return (
		<div className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<Field
					label={t("memorials.nameEn")}
					onChange={(v) => update("nameEn", v)}
					value={String(values.nameEn ?? "")}
				/>
				<Field
					label={t("memorials.nameZh")}
					onChange={(v) => update("nameZh", v)}
					value={String(values.nameZh ?? "")}
				/>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field
					label={t("memorials.gender")}
					onChange={(v) => update("gender", v)}
					value={String(values.gender ?? "")}
				/>
				<Field
					label={t("memorials.nric")}
					onChange={(v) => update("nric", v)}
					value={String(values.nric ?? "")}
				/>
			</div>
			<Field
				label={t("memorials.familyOrigin")}
				onChange={(v) => update("familyOrigin", v)}
				value={String(values.familyOrigin ?? "")}
			/>
		</div>
	);
}

function StepDetails({ values, update, t }: StepProps) {
	return (
		<div className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<Field
					label={t("memorials.dateOfBirth")}
					onChange={(v) => update("dateOfBirth", v)}
					type="date"
					value={String(values.dateOfBirth ?? "")}
				/>
				<Field
					label={t("memorials.dateOfBirthLunar")}
					onChange={(v) => update("dateOfBirthLunar", v)}
					placeholder="e.g. 农历二月初三"
					value={String(values.dateOfBirthLunar ?? "")}
				/>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field
					label={t("memorials.dateOfDeath")}
					onChange={(v) => update("dateOfDeath", v)}
					type="date"
					value={String(values.dateOfDeath ?? "")}
				/>
				<Field
					label={t("memorials.dateOfDeathLunar")}
					onChange={(v) => update("dateOfDeathLunar", v)}
					placeholder="e.g. 农历五月十五"
					value={String(values.dateOfDeathLunar ?? "")}
				/>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field
					label={t("memorials.internmentStatus")}
					onChange={(v) => update("internmentStatus", v)}
					value={String(values.internmentStatus ?? "")}
				/>
				<Field
					label={t("memorials.memorialServiceDate")}
					onChange={(v) => update("memorialServiceDate", v)}
					type="date"
					value={String(values.memorialServiceDate ?? "")}
				/>
			</div>
			<Field
				label={t("memorials.photo")}
				onChange={(v) => update("photo", v)}
				placeholder="https://..."
				value={String(values.photo ?? "")}
			/>
		</div>
	);
}

function StepCategory({
	values,
	update,
	t,
	categories,
}: StepProps & {
	categories: Array<{
		id: string;
		nameEn: string | null;
		nameZh: string | null;
	}>;
}) {
	return (
		<div className="space-y-4">
			<div>
				<Label>{t("memorials.category")}</Label>
				<Select
					onValueChange={(val) =>
						update("categoryId", val === "none" ? "" : (val ?? ""))
					}
					value={String(values.categoryId) || "none"}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">— None —</SelectItem>
						{categories.map((cat) => (
							<SelectItem key={cat.id} value={cat.id}>
								{cat.nameEn ?? cat.nameZh ?? "Untitled"}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field
					label={t("memorials.serialNumber")}
					onChange={(v) => update("serialNumber", v)}
					value={String(values.serialNumber ?? "")}
				/>
				<Field
					label={t("memorials.location")}
					onChange={(v) => update("location", v)}
					value={String(values.location ?? "")}
				/>
			</div>
			<div className="flex items-center gap-2">
				<input
					checked={values.isPublic}
					className="size-4"
					id="isPublic"
					onChange={(e) => update("isPublic", e.target.checked)}
					type="checkbox"
				/>
				<Label htmlFor="isPublic">{t("memorials.isPublic")}</Label>
			</div>
		</div>
	);
}

function StepReview({ values, t }: Omit<StepProps, "update">) {
	const fields = [
		["memorials.nameEn", values.nameEn],
		["memorials.nameZh", values.nameZh],
		["memorials.gender", values.gender],
		["memorials.nric", values.nric],
		["memorials.familyOrigin", values.familyOrigin],
		["memorials.dateOfBirth", values.dateOfBirth],
		["memorials.dateOfBirthLunar", values.dateOfBirthLunar],
		["memorials.dateOfDeath", values.dateOfDeath],
		["memorials.dateOfDeathLunar", values.dateOfDeathLunar],
		["memorials.serialNumber", values.serialNumber],
		["memorials.location", values.location],
		["memorials.internmentStatus", values.internmentStatus],
		["memorials.isPublic", values.isPublic ? "Yes" : "No"],
	] as const;

	return (
		<div className="space-y-2">
			{fields.map(([key, value]) => (
				<div className="flex justify-between border-b py-1.5 text-sm" key={key}>
					<span className="text-muted-foreground">{t(key)}</span>
					<span>{String(value) || "—"}</span>
				</div>
			))}
		</div>
	);
}

function Field({
	label,
	value,
	onChange,
	type = "text",
	placeholder,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: string;
	placeholder?: string;
}) {
	return (
		<div className="space-y-1">
			<Label>{label}</Label>
			<Input
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				type={type}
				value={value}
			/>
		</div>
	);
}
