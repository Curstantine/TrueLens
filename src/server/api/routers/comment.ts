import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";

export const commentRouter = createTRPCRouter({
	create: publicProcedure
		.input(
			z.object({
				content: z.string().min(1, "Comment cannot be empty"),
				articleId: z.string().min(1, "Article ID is required"),
				createdBy: z.string().min(1, "User ID is required"),
			}),
		)
		.mutation(async ({ input }) => {
			const article = await db.article.findUnique({ where: { id: input.articleId } });
			if (!article) throw new TRPCError({ code: "NOT_FOUND", message: "Article not found." });

			const user = await db.user.findUnique({ where: { id: input.createdBy } });
			if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });

			return await db.comment.create({ data: input });
		}),
});
