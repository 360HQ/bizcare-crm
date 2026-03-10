import qrcode from "qrcode-generator";
import { useEffect, useRef } from "react";

export function QRCode({
	value,
	size = 160,
	className,
}: {
	value: string;
	size?: number;
	className?: string;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const qr = qrcode(0, "M");
		qr.addData(value);
		qr.make();

		const moduleCount = qr.getModuleCount();
		const cellSize = size / moduleCount;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}

		canvas.width = size;
		canvas.height = size;

		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, size, size);

		ctx.fillStyle = "#1a1a1a";
		for (let row = 0; row < moduleCount; row++) {
			for (let col = 0; col < moduleCount; col++) {
				if (qr.isDark(row, col)) {
					ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
				}
			}
		}
	}, [value, size]);

	return (
		<canvas className={className} height={size} ref={canvasRef} width={size} />
	);
}
