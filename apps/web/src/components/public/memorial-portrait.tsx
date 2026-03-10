import { QRCode } from "./qr-code";
import { ShareButton } from "./share-button";

interface MemorialData {
	categoryNameEn: string | null;
	categoryNameZh: string | null;
	dateOfBirth: string | null;
	dateOfBirthLunar: string | null;
	dateOfDeath: string | null;
	dateOfDeathLunar: string | null;
	familyOrigin: string | null;
	gender: string | null;
	location: string | null;
	nameEn: string | null;
	nameZh: string | null;
	photo: string | null;
	publicSlug: string | null;
}

function DetailRow({
	label,
	value,
	sublabel,
}: {
	label: string;
	value: string | null;
	sublabel?: string | null;
}) {
	if (!value) {
		return null;
	}
	return (
		<div className="flex justify-between border-amber-200/30 border-b py-2 last:border-0 dark:border-amber-800/30">
			<span className="text-amber-700 text-sm dark:text-amber-400">
				{label}
			</span>
			<div className="text-right">
				<span className="text-amber-950 text-sm dark:text-amber-100">
					{value}
				</span>
				{sublabel && (
					<p className="text-amber-600 text-xs dark:text-amber-500">
						{sublabel}
					</p>
				)}
			</div>
		</div>
	);
}

export function MemorialPortrait({
	memorial,
	permalink,
}: {
	memorial: MemorialData;
	permalink: string;
}) {
	const displayName = memorial.nameZh ?? memorial.nameEn ?? "Unknown";

	return (
		<div className="mx-auto max-w-md space-y-6">
			<div className="flex flex-col items-center gap-4 text-center">
				{memorial.photo ? (
					<img
						alt={displayName}
						className="size-32 rounded-full border-4 border-amber-200 object-cover shadow-lg dark:border-amber-800"
						height={128}
						src={memorial.photo}
						width={128}
					/>
				) : (
					<div className="flex size-32 items-center justify-center rounded-full border-4 border-amber-200 bg-amber-100 font-serif text-4xl text-amber-800 shadow-lg dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
						{displayName.charAt(0)}
					</div>
				)}

				{memorial.nameZh && (
					<h1 className="font-serif text-3xl text-amber-950 dark:text-amber-100">
						{memorial.nameZh}
					</h1>
				)}
				{memorial.nameEn && (
					<p className="text-amber-700 text-lg dark:text-amber-300">
						{memorial.nameEn}
					</p>
				)}

				{(memorial.categoryNameZh ?? memorial.categoryNameEn) && (
					<span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800 text-xs dark:bg-amber-900/40 dark:text-amber-200">
						{memorial.categoryNameZh ?? memorial.categoryNameEn}
					</span>
				)}
			</div>

			<div className="rounded-lg border border-amber-200/30 bg-amber-50/30 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
				<DetailRow label="Gender" value={memorial.gender} />
				<DetailRow
					label="Date of Birth"
					sublabel={memorial.dateOfBirthLunar}
					value={memorial.dateOfBirth}
				/>
				<DetailRow
					label="Date of Death"
					sublabel={memorial.dateOfDeathLunar}
					value={memorial.dateOfDeath}
				/>
				<DetailRow label="Family Origin" value={memorial.familyOrigin} />
				<DetailRow label="Location" value={memorial.location} />
			</div>

			<div className="flex flex-col items-center gap-4">
				<QRCode
					className="rounded-lg border border-amber-200/30 p-2 dark:border-amber-800/30"
					size={160}
					value={permalink}
				/>
				<p className="text-amber-600 text-xs dark:text-amber-500">
					Scan to visit this memorial
				</p>
				<ShareButton name={displayName} url={permalink} />
			</div>
		</div>
	);
}
