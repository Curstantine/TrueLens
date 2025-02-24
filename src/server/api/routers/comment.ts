import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const commentRouter = createTRPCRouter({
	/**
	 * Create a new comment.
	 */
	create: publicProcedure
		.input(
			z.object({
				content: z.string().min(1, "Comment cannot be empty"),
				articleId: z.string().min(1, "Article ID is required"),
				createdBy: z.string().min(1, "User ID is required"),
			}),
		)
		.mutation(async ({ input }) => {
			// Validate if article exists
			const articleExists = await db.article.findUnique({
				where: { id: input.articleId },
				select: { id: true },
			});

        });