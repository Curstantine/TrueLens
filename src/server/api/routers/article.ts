import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { TRPCError } from "@trpc/server";

export const articleRouter = createTRPCRouter({
	/**
	 * Create a new article.
	 * API Call: POST http://localhost:3000/api/trpc/article.create
	 *
	 * Expected Input:
	 * {
	 * "json": {
	 *   "title": "Article Title",
	 *   "content": "Article content here...",
	 *   "reporterId": "reporter_unique_id",
	 *   "storyId": "story_unique_id"
	 *    }
	 * }
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
			try {
				console.log("Received input for article.create:", input);

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
			} catch (error) {
				console.error("Error creating article:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create article.",
				});
			}
		}),

	/**
	 * Get all articles.
	 * API Call: GET http://localhost:3000/api/trpc/article.getAll
	 *
	 * Returns an array of articles including related reporter, story, and comments.
	 */
	getAll: publicProcedure.query(async () => {
		try {
			return await db.article.findMany({
				include: { reporter: true, story: true, comments: true },
			});
		} catch (error) {
			console.error("Error fetching articles:", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch articles.",
			});
		}
	}),

	/**
	 * Get an article by its ID.
	 * API Call: GET http://localhost:3000/api/trpc/article.getById?input={"json":{"id":"article_id_here"}}
	 */
	getById: publicProcedure
		.input(z.object({ id: z.string().min(1, "Article ID is required") }))
		.query(async ({ input }) => {
			try {
				console.log("Received input for article.getById:", input);

				// Fetch the article by ID
				const article = await db.article.findUnique({
					where: { id: input.id },
					include: { reporter: true, story: true, comments: true },
				});

				if (!article) {
					throw new TRPCError({ code: "NOT_FOUND", message: "Article not found." });
				}
				return article;
			} catch (error) {
				console.error("Error fetching article:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch article.",
				});
			}
		}),

	/**
	 * Update an existing article.
	 * API Call: PATCH http://localhost:3000/api/trpc/article.update
	 *
	 * Expected Input:
	 * {
	 *  "json": {
	 *   "id": "article_unique_id",
	 *   "title": "Updated Title (optional)",
	 *   "content": "Updated Content (optional)",
	 *   "authorId": "Updated Author ID (optional)"
	 * }
	 * }
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
			try {
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
			} catch (error) {
				console.error("Error updating article:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update article.",
				});
			}
		}),

	/**
	 * Delete an article by ID.
	 * API Call: DELETE http://localhost:3000/api/trpc/article.delete
	 *Expected Input:
	 * {"json":
	 *   { "id": "67a49b25d656ae8ea680d2df"}
	 *    }
	 */
	delete: publicProcedure
		.input(z.object({ id: z.string().min(1, "Article ID is required") }))
		.mutation(async ({ input }) => {
			try {
				const article = await db.article.findUnique({ where: { id: input.id } });
				if (!article) {
					throw new TRPCError({ code: "NOT_FOUND", message: "Article not found." });
				}

				await db.article.delete({ where: { id: input.id } });
				return { message: "Article deleted successfully." };
			} catch (error) {
				console.error("Error deleting article:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete article.",
				});
			}
		}),
});
