import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
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
			const article = await db.article.findUnique({ 
				where: { id: input.articleId },
				select: {id: true},
			});
			if (!article) throw new TRPCError({ code: "NOT_FOUND", message: "Article not found." });

			const user = await db.user.findUnique({ 
				where: { id: input.createdBy },
			    select: {id: true},
			});
			if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });

			const newComment = await db.comment.create({
				data: {
					content: input.content,
					articleId: input.articleId,
					createdBy: input.createdBy,
				},
			});

			return newComment;
		}),
});
	getByArticle: publicProcedure
		.input(z.object({ articleId: z.string().min(1, "Article ID is required") }))
		.query(async ({ input }) => {
			return await db.comment.findMany({
				where: { articleId: input.articleId },
				include: { user: true },
			});
		}),

	getById: publicProcedure
		.input(z.object({ id: z.string().min(1, "Comment ID is required") }))
		.query(async ({ input }) => {
			const comment = await db.comment.findUnique({
				where: { id: input.id },
				include: { user: true, article: true },
			});
			if (!comment) throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found." });

			return comment;
		}),

		update: publicProcedure
		.input(
			z.object({
				id: z.string().min(1, "Comment ID is required"),
				content: z.string().min(1, "Updated content is required"),
			}),
		)
		.mutation(async ({ input }) => {
			const comment = await db.comment.findUnique({ where: { id: input.id } });
			if (!comment) throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found." });

			return await db.comment.update({
				where: { id: input.id },
				data: { content: input.content },
			});
		}),

		delete: publicProcedure
		.input(z.object({ id: z.string().min(1, "Comment ID is required") }))
		.mutation(async ({ input }) => {
			const comment = await db.comment.findUnique({ where: { id: input.id } });
			if (!comment) throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found." });

			await db.comment.delete({ where: { id: input.id } });

			return { message: "Comment deleted successfully." };
		}),
});

