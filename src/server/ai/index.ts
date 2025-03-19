import { cache } from "react";
import { ChatGroq } from "@langchain/groq";

import { env } from "~/env";

export const summarizationModel = cache(
	() =>
		new ChatGroq({
			model: "llama-3.2-3b-preview",
			temperature: 0.85,
			apiKey: env.GROQ_API_KEY,
		}),
);

export const factCheckingModel = cache(
	() =>
		new ChatGroq({
			model: "llama-3.3-70b-versatile",
			temperature: 0.6,
			apiKey: env.GROQ_API_KEY,
		}),
);
