import { config } from "dotenv";

// Load .env before any other imports access process.env
config({ path: ".env" });

// Now import the app
const { default: app } = await import("./index");

const port = 3000;
console.log(`Server running at http://localhost:${port}`);

export default {
	port,
	fetch: app.fetch,
};
