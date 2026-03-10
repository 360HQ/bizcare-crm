import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ShareButton({ url, name }: { url: string; name: string }) {
	function handleWhatsApp() {
		const text = encodeURIComponent(`In loving memory of ${name}\n${url}`);
		window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
	}

	async function handleShare() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: `In memory of ${name}`,
					url,
				});
			} catch {
				// user cancelled
			}
		} else {
			await navigator.clipboard.writeText(url);
			toast.success("Link copied to clipboard");
		}
	}

	return (
		<div className="flex gap-2">
			<Button onClick={handleWhatsApp} size="sm" variant="outline">
				WhatsApp
			</Button>
			<Button onClick={handleShare} size="sm" variant="outline">
				<Share2 className="size-4" />
				Share
			</Button>
		</div>
	);
}
