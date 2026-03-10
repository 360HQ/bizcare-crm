import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { MemorialForm } from "@/components/memorial/memorial-form";
import { useTranslation } from "@/lib/i18n";
import { queryClient, trpcClient } from "@/utils/trpc";

export const Route = createFileRoute("/_admin/memorials/new")({
	component: NewMemorialPage,
});

function NewMemorialPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const createMemorial = useMutation({
		mutationFn: (
			input: Parameters<typeof trpcClient.memorial.memorial.create.mutate>[0]
		) => trpcClient.memorial.memorial.create.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [["memorial", "memorial", "list"]],
			});
			toast.success(t("memorials.created"));
			navigate({ to: "/memorials" });
		},
		onError: (err) => toast.error(err.message),
	});

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<h1 className="font-semibold text-xl">{t("memorials.add")}</h1>
			<MemorialForm
				onSubmit={(values) => createMemorial.mutate(values)}
				submitting={createMemorial.isPending}
			/>
		</div>
	);
}
