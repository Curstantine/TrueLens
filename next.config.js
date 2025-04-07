/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "1pyh0peyi3duiz1l.public.blob.vercel-storage.com" },
			{ protocol: "https", hostname: "lh3.googleusercontent.com" },
		],
	},
	experimental: {
		nodeMiddleware: true,
	},
};

export default config;
