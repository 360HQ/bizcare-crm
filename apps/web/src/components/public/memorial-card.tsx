import { Link } from "@tanstack/react-router";

export function MemorialCard({
	nameEn,
	nameZh,
	photo,
	slug,
	location,
	categoryName,
}: {
	nameEn: string | null;
	nameZh: string | null;
	photo: string | null;
	slug: string | null;
	location: string | null;
	categoryName: string | null;
}) {
	if (!slug) {
		return null;
	}

	return (
		<Link
			className="group flex gap-4 rounded-lg border border-amber-200/30 bg-amber-50/50 p-4 transition-colors hover:bg-amber-100/50 dark:border-amber-900/30 dark:bg-amber-950/20 dark:hover:bg-amber-950/40"
			params={{ slug }}
			to="/m/$slug"
		>
			{photo ? (
				<img
					alt={nameEn ?? nameZh ?? "Memorial photo"}
					className="size-16 rounded-md object-cover"
					height={64}
					src={photo}
					width={64}
				/>
			) : (
				<div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-amber-100 text-2xl text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
					{(nameZh ?? nameEn ?? "?").charAt(0)}
				</div>
			)}
			<div className="min-w-0 flex-1">
				<p className="font-medium text-amber-950 dark:text-amber-100">
					{nameZh ?? nameEn}
				</p>
				{nameEn && nameZh && (
					<p className="text-amber-700 text-sm dark:text-amber-300">{nameEn}</p>
				)}
				<div className="mt-1 flex gap-2 text-amber-600 text-xs dark:text-amber-400">
					{categoryName && <span>{categoryName}</span>}
					{location && <span>{location}</span>}
				</div>
			</div>
		</Link>
	);
}
