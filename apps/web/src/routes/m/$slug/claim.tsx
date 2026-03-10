import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";

import { ClaimForm } from "@/components/public/claim-form";
import { Button } from "@/components/ui/button";
import { trpc, trpcClient } from "@/utils/trpc";

export const Route = createFileRoute("/m/$slug/claim")({
	component: ClaimPage,
});

function ClaimPage() {
	const { slug } = Route.useParams();
	const navigate = useNavigate();
	const [submitted, setSubmitted] = useState(false);

	const memorial = useQuery(
		trpc.memorial.public.getBySlug.queryOptions({ slug })
	);

	const submitClaim = useMutation({
		mutationFn: (values: {
			fullName: string;
			relationship: string;
			nric: string;
			phone: string;
			email: string;
		}) => {
			if (!memorial.data) {
				throw new Error("Memorial not loaded");
			}
			return trpcClient.memorial.claim.submit.mutate({
				memorialId: memorial.data.id,
				fullName: values.fullName,
				relationship: values.relationship,
				nric: values.nric || undefined,
				phone: values.phone || undefined,
				email: values.email || undefined,
			});
		},
		onSuccess: () => setSubmitted(true),
	});

	if (memorial.isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-amber-600 dark:text-amber-400">Loading...</p>
			</div>
		);
	}

	if (!memorial.data) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
				<p className="text-amber-800 dark:text-amber-200">Memorial not found</p>
				<Link to="/m">
					<Button size="sm" variant="outline">
						Back to search
					</Button>
				</Link>
			</div>
		);
	}

	const displayName = memorial.data.nameZh ?? memorial.data.nameEn ?? "Unknown";

	if (submitted) {
		return (
			<div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
				<CheckCircle className="size-16 text-green-600 dark:text-green-400" />
				<h1 className="font-serif text-2xl text-amber-950 dark:text-amber-100">
					Registration Received
				</h1>
				<p className="text-amber-700 text-sm dark:text-amber-300">
					Thank you for registering your connection to {displayName}. The temple
					will review your submission.
				</p>
				<Button
					onClick={() => navigate({ to: "/m/$slug", params: { slug } })}
					variant="outline"
				>
					Return to Memorial
				</Button>
			</div>
		);
	}

	return (
		<div className="mx-auto min-h-screen max-w-md px-4 py-8">
			<div className="mb-6">
				<Link params={{ slug }} to="/m/$slug">
					<Button size="sm" variant="ghost">
						<ArrowLeft className="size-4" />
						Back to {displayName}
					</Button>
				</Link>
			</div>

			<div className="mb-6 text-center">
				<h1 className="font-serif text-2xl text-amber-950 dark:text-amber-100">
					Register as Family
				</h1>
				<p className="mt-1 text-amber-700 text-sm dark:text-amber-300">
					{displayName}
				</p>
			</div>

			<ClaimForm
				onSubmit={(values) => submitClaim.mutate(values)}
				submitting={submitClaim.isPending}
			/>
		</div>
	);
}
