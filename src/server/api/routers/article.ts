import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const articleRouter = createTRPCRouter({
	/**
	 * Create a new article.
	 */
	create: publicProcedure
		.input(
			z.object({
				title: z.string().min(1, "Title is required"),
				content: z.string().min(1, "Content is required"),
				reporterId: z.string().min(1, "Reporter ID is required"),
				storyId: z.string().min(1, "Story ID is required"),
			}),
		)
		.mutation(async ({ input }) => {
			// Validate that the reporter exists
			const reporterExists = await db.reporter.findUnique({
				where: { id: input.reporterId },
				select: { id: true },
			});

			if (!reporterExists) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Reporter not found." });
			}

			// Validate that the story exists
			const storyExists = await db.story.findUnique({
				where: { id: input.storyId },
				select: { id: true },
			});

			if (!storyExists) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Story not found." });
			}

			// Create a new article
			return await db.article.create({ data: input });
		}),

	/**
	 * Get all articles.
	 *
	 * Returns an array of articles including related reporter, story, and comments.
	 */
	getAll: publicProcedure.query(async () => {
		return await db.article.findMany({
			include: { reporter: true, story: true, comments: true },
		});
	}),

	/**
	 * Get an article by its ID.
	 */
	getById: publicProcedure
		.input(z.object({ id: z.string().min(1, "Article ID is required") }))
		.query(async ({ input }) => {
			// Fetch the article by ID
			const article = await db.article.findUnique({
				where: { id: input.id },
				include: { reporter: true, story: true, comments: true },
			});

			if (!article) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Article not found." });
			}

			return article;
		}),

	/**
	 * Update an existing article.
	 */
	update: publicProcedure
		.input(
			z.object({
				id: z.string().min(1, "ID is required"), // Ensure ID is provided
				title: z.string().optional(),
				content: z.string().optional(),
				authorId: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const { id, ...updateData } = input;

			// Ensure there is at least one field to update
			if (Object.keys(updateData).length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "At least one field must be provided for update.",
				});
			}

			// Update the article
			const updatedArticle = await db.article.update({
				where: { id },
				data: updateData,
			});

			return updatedArticle;
		}),

	/**
	 * Delete an article by ID.
	 */
	delete: publicProcedure
		.input(z.object({ id: z.string().min(1, "Article ID is required") }))
		.mutation(async ({ input }) => {
			const article = await db.article.findUnique({ where: { id: input.id } });
			if (!article) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Article not found." });
			}

			await db.article.delete({ where: { id: input.id } });
			return { message: "Article deleted successfully." };
		}),
});
