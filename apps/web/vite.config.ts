import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		tailwindcss(),
		tanstackRouter({}),
		react(),
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				name: "BizCARE CRM",
				short_name: "BizCARE CRM",
				description: "Digital memorial registry for Chinese Buddhist temples",
				theme_color: "#451a03",
				background_color: "#fffbeb",
			},
			pwaAssets: { disabled: false, config: true },
			devOptions: { enabled: true },
			workbox: {
				runtimeCaching: [
					{
						urlPattern: /^\/m\/.*/,
						handler: "NetworkFirst",
						options: {
							cacheName: "memorial-pages",
							expiration: { maxEntries: 50, maxAgeSeconds: 86_400 },
						},
					},
					{
						urlPattern: /\/trpc\/memorial\.public\..*/,
						handler: "NetworkFirst",
						options: {
							cacheName: "memorial-api",
							expiration: { maxEntries: 100, maxAgeSeconds: 3600 },
						},
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
	server: {
		port: 3001,
	},
});
