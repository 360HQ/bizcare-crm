/// <reference path="../env.d.ts" />

// Unified env: uses Cloudflare Workers bindings in production,
// falls back to process.env for local development.

export type ServerEnv = {
	CORS_ORIGIN: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	DATABASE_URL: string;
	ATTACHMENTS_BUCKET?: unknown;
};

// Local dev: process.env (dotenv loaded by caller)
// Workers: cloudflare:workers env is set via setWorkerEnv() at startup
let _env: ServerEnv = process.env as unknown as ServerEnv;

export function setWorkerEnv(workerEnv: ServerEnv) {
	_env = workerEnv;
}

export const env = new Proxy({} as ServerEnv, {
	get(_target, prop, receiver) {
		return Reflect.get(_env, prop, receiver);
	},
});
