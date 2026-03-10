import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart } from "lucide-react";

import { MemorialPortrait } from "@/components/public/memorial-portrait";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/m/$slug")({
	component: MemorialPage,
});

function MemorialPage() {
	const { slug } = Route.useParams();

	const memorial = useQuery(
		trpc.memorial.public.getBySlug.queryOptions({ slug })
	);

	if (memorial.isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-amber-600 dark:text-amber-400">Loading...</p>
			</div>
		);
	}

	if (memorial.error) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
				<p className="text-amber-800 dark:text-amber-200">Memorial not found</p>
				<Link to="/m">
					<Button size="sm" variant="outline">
						<ArrowLeft className="size-4" />
						Back to search
					</Button>
				</Link>
			</div>
		);
	}

	if (!memorial.data) {
		return null;
	}

	const permalink = `${window.location.origin}/m/${slug}`;

	return (
		<div className="mx-auto min-h-screen max-w-lg px-4 py-8">
			<div className="mb-6 flex items-center justify-between">
				<Link to="/m">
					<Button size="sm" variant="ghost">
						<ArrowLeft className="size-4" />
						Back
					</Button>
				</Link>
				<Link params={{ slug }} to="/m/$slug/claim">
					<Button
						className="text-amber-800 dark:text-amber-200"
						size="sm"
						variant="outline"
					>
						<Heart className="size-4" />I am family
					</Button>
				</Link>
			</div>

			<MemorialPortrait memorial={memorial.data} permalink={permalink} />
		</div>
	);
}
