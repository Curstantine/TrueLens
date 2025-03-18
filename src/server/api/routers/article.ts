import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { objectId } from "~/server/validation/mongo";

export const articleRouter = createTRPCRouter({
	/**
	 * Create a new article.
	 */
	create: publicProcedure
		.input(
			z.object({
				title: z.string().min(1, "Title is required"),
				content: z.string().min(1, "Content is required"),
				reporterId: objectId("Reporter ID must be a valid MongoDB ObjectId"),
				storyId: objectId("Story ID must be a valid MongoDB ObjectId"),
				outletId: objectId("Outlet ID must be a valid MongoDB ObjectId"),
				externalUrl: z.string().url("External URL must be a valid URL"),
				factuality: z.number().min(0).max(100),
				publishedAt: z.string().datetime("Published At must be a valid datetime"),
			}),
		)
		.mutation(async ({ input }) => {
			const [article, reporter, outlet, story] = await Promise.all([
				db.article.findUnique({
					where: { externalUrl: input.externalUrl },
					select: { id: true },
				}),
				db.reporter.findUnique({
					where: { id: input.reporterId },
					select: { id: true },
				}),
				db.newsOutlet.findUnique({
					where: { id: input.outletId },
					select: { id: true },
				}),
				db.story.findUnique({
					where: { id: input.storyId },
					select: { id: true },
				}),
			]);

			if (article) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Article already exists.",
					cause: `Article by external URL ${input.externalUrl} already exists at ID ${article.id}`,
				});
			}

			if (!reporter) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Reporter not found." });
			}

			if (!outlet) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Outlet not found." });
			}

			if (!story) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Story not found." });
			}

			return await db.article.create({
				data: {
					title: input.title,
					content: input.content,
					reporterId: input.reporterId,
					outletId: input.outletId,
					storyId: input.storyId,
					externalUrl: input.externalUrl,
					factuality: input.factuality,
					publishedAt: input.publishedAt,
				},
			});
		}),
	getAll: publicProcedure.query(async () => {
		return await db.article.findMany({
			include: { reporter: true, story: true },
		});
	}),
	getById: publicProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.query(async ({ input }) => {
			const article = await db.article.findUnique({
				where: { id: input.id },
				include: { reporter: true, story: true },
			});

			if (!article) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Article not found." });
			}

			return article;
		}),
	update: publicProcedure
		.input(
			z.object({
				id: objectId("Article ID must be a valid MongoDB ObjectId"),
				title: z.string().min(1, "Title is required").optional(),
				content: z.string().min(1, "Content is required").optional(),
				reporterId: objectId("Reporter ID must be a valid MongoDB ObjectId").optional(),
				outletId: objectId("Outlet ID must be a valid MongoDB ObjectId").optional(),
				storyId: objectId("Story ID must be a valid MongoDB ObjectId").optional(),
				externalUrl: z.string().url("External URL must be a valid URL").optional(),
				factuality: z.number().min(0).max(100).optional(),
				publishedAt: z
					.string()
					.datetime("Published At must be a valid datetime")
					.optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const article = await db.article.findUnique({
				where: { id: input.id },
				select: { id: true },
			});

			if (!article) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Article not found." });
			}

			if (input.reporterId) {
				const reporter = await db.reporter.findUnique({
					where: { id: input.reporterId },
					select: { id: true },
				});

				if (!reporter) {
					throw new TRPCError({ code: "NOT_FOUND", message: "Reporter not found." });
				}
			}

			if (input.outletId) {
				const outlet = await db.newsOutlet.findUnique({
					where: { id: input.outletId },
					select: { id: true },
				});

				if (!outlet) {
					throw new TRPCError({ code: "NOT_FOUND", message: "Outlet not found." });
				}
			}

			if (input.storyId) {
				const story = await db.story.findUnique({
					where: { id: input.storyId },
					select: { id: true },
				});

				if (!story) {
					throw new TRPCError({ code: "NOT_FOUND", message: "Story not found." });
				}
			}

			return await db.article.update({
				where: { id: input.id },
				data: {
					title: input.title,
					content: input.content,
					reporterId: input.reporterId,
					outletId: input.outletId,
					storyId: input.storyId,
					externalUrl: input.externalUrl,
					factuality: input.factuality,
					publishedAt: input.publishedAt,
				},
			});
		}),
	delete: publicProcedure
		.input(z.object({ id: z.string().min(1, "Article ID is required") }))
		.mutation(async ({ input }) => {
			const article = await db.article.findUnique({
				where: { id: input.id },
				select: { id: true },
			});

			if (!article) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Article not found." });
			}

			await db.article.delete({ where: { id: input.id } });
			return { message: "Article deleted successfully." };
		}),
});
