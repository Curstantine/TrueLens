import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const articleRouter = createTRPCRouter({
	create: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).default(50),
				take: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const articles = await ctx.db.article.findFirst({
				orderBy: { createdAt: "desc" },
				take: input.limit,
				skip: input.take,
			});

			return articles;
		}),
});
