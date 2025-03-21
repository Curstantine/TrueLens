import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { objectId } from "~/server/validation/mongo";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const storyRouter = createTRPCRouter({
	create: publicProcedure
		.input(
			z.object({
				title: z.string().min(1, "Title is required"),
				summary: z.array(z.string()).min(1, "Summary is required"),
				cover: z.optional(z.string()),
			}),
		)
		.mutation(async ({ input }) => {
			return db.story.create({
				data: {
					title: input.title,
					summary: input.summary,
					cover: input.cover,
					status:"NEEDS_APPROVAL",
				},
			});
		}),

	getAll: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(100),
				offset: z.number().min(0).default(0),
				orderBy: z.enum(["createdAt", "title"]).default("createdAt"),
				orderDirection: z.enum(["asc", "desc"]).default("desc"),
				status: z.enum(["NEEDS_APPROVAL", "PUBLISHED"]).default("PUBLISHED"),
			}),
		)
		.query(async ({ input }) => {
			return db.story.findMany({
				take: input.limit,
				skip: input.offset,
				where: { status: input.status },
				select: {
					id: true,
					title: true,
					createdAt: true,
					modifiedAt: true,
					cover: true,
					_count: {
						select: { articles: true },
					},
				},
				orderBy: {
					[input.orderBy]: input.orderDirection,
				},
			});
		}),
	
	getPendingStories: publicProcedure
    .query(async () => {
        return db.story.findMany({
            where: { status: "NEEDS_APPROVAL" }, // Fetch only stories that need approval
            select: {
                id: true,
                title: true,
                createdAt: true,
                modifiedAt: true,
                cover: true,
                _count: {
                    select: { articles: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }),

	approveStory: publicProcedure
    .input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
    .mutation(async ({ input }) => {
        return db.story.update({
            where: { id: input.id },
            data: { status: "PUBLISHED" }, // Change status to PUBLISHED
        });
    }),

	getById: publicProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.query(async ({ input }) => {
			const story = await db.story.findUnique({
				where: { id: input.id },
				include: {
					articles: {
						include: {
							reporter: true,
							outlet: true,
						},
					},
				},
			});

			if (!story) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Story not found.",
				});
			}

			const totalScore = story.articles.reduce((acc, x) => acc + x.factuality, 0);
			return { ...story, factuality: totalScore / story.articles.length };
		}),

	update: publicProcedure
		.input(
			z.object({
				id: objectId("id must be a valid MongoDB ObjectId"),
				title: z.optional(z.string().min(1, "Title is required")),
				summary: z.optional(z.array(z.string()).min(1, "At least one summary is required")),
				cover: z.optional(z.string()),
			}),
		)
		.mutation(async ({ input }) => {
			const story = await db.story.update({
				where: { id: input.id },
				data: {
					title: input.title,
					summary: input.summary,
					cover: input.cover,
					modifiedAt: new Date(),
				},
			});

			return story;
		}),

	delete: publicProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.mutation(async ({ input }) => {
			return await db.$transaction([
				db.article.deleteMany({ where: { storyId: input.id } }),
				db.story.delete({ where: { id: input.id } }),
			]);
		}),
});
