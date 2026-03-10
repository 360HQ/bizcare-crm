import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";

export function ViewManager({
	moduleId,
	onViewChange,
}: {
	moduleId: string;
	onViewChange?: (viewId: string | null) => void;
}) {
	const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
	const [newViewName, setNewViewName] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);

	const views = useQuery(trpc.core.view.list.queryOptions({ moduleId }));

	const createView = useMutation({
		mutationFn: (name: string) =>
			trpcClient.core.view.create.mutate({ moduleId, name }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [["core", "view"]] });
			toast.success("View saved");
			setNewViewName("");
			setDialogOpen(false);
		},
		onError: (err) => toast.error(err.message),
	});

	const deleteView = useMutation({
		mutationFn: (id: string) => trpcClient.core.view.delete.mutate({ id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [["core", "view"]] });
			setSelectedViewId(null);
			onViewChange?.(null);
			toast.success("View deleted");
		},
		onError: (err) => toast.error(err.message),
	});

	function handleViewChange(val: string | null) {
		const id = !val || val === "all" ? null : val;
		setSelectedViewId(id);
		onViewChange?.(id);
	}

	return (
		<div className="flex items-center gap-2">
			<Select onValueChange={handleViewChange} value={selectedViewId ?? "all"}>
				<SelectTrigger className="w-44">
					<SelectValue placeholder="All records" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All records</SelectItem>
					{views.data?.map((view) => (
						<SelectItem key={view.id} value={view.id}>
							{view.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{selectedViewId && (
				<Button
					onClick={() => deleteView.mutate(selectedViewId)}
					size="icon"
					variant="ghost"
				>
					<Trash2 className="size-4" />
				</Button>
			)}

			<Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
				<DialogTrigger render={<Button size="icon" variant="ghost" />}>
					<Plus className="size-4" />
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Save View</DialogTitle>
					</DialogHeader>
					<div className="space-y-2">
						<Label>View Name</Label>
						<Input
							onChange={(e) => setNewViewName(e.target.value)}
							placeholder="e.g. VIP Contacts"
							value={newViewName}
						/>
					</div>
					<DialogFooter>
						<DialogClose render={<Button variant="outline" />}>
							Cancel
						</DialogClose>
						<Button
							disabled={!newViewName.trim() || createView.isPending}
							onClick={() => createView.mutate(newViewName.trim())}
						>
							Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
