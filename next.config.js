/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { env } from "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	redirects: async () => {
		if (env.NODE_ENV === "development") return [];

		return [
			{
				source: "/",
				destination: "/landing",
				permanent: false,
			},
		];
	},
};

export default config;
