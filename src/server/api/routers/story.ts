import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { StoryStatus } from "@prisma/client";

import { db } from "~/server/db";
import { objectId } from "~/server/validation/mongo";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
			return await db.story.create({
				data: {
					title: input.title,
					summary: input.summary,
					cover: input.cover,
					status: StoryStatus.NEEDS_APPROVAL,
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
				status: z.nativeEnum(StoryStatus).default(StoryStatus.PUBLISHED).or(z.null()),
			}),
		)
		.query(async ({ input }) => {
			const [total, docs] = await db.$transaction([
				db.story.count({
					where: { status: input.status !== null ? input.status : undefined },
				}),
				db.story.findMany({
					take: input.limit,
					skip: input.offset,
					where: { status: input.status !== null ? input.status : undefined },
					select: {
						id: true,
						title: true,
						createdAt: true,
						modifiedAt: true,
						cover: true,
						status: true,
						_count: {
							select: { articles: true },
						},
					},
					orderBy: {
						[input.orderBy]: input.orderDirection,
					},
				}),
			]);

			return { docs, total };
		}),
	approveStory: publicProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.mutation(async ({ input }) => {
			return await db.story.update({
				where: { id: input.id },
				data: { status: StoryStatus.PUBLISHED },
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
				throw new TRPCError({ code: "NOT_FOUND", message: "Story not found" });
			}

			const totalScore = story.articles.reduce((acc, x) => acc + x.factuality, 0);
			return { ...story, factuality: totalScore / story.articles.length };
		}),
	getAllOutOfSync: adminProcedure.query(async () => {
		return await db.story.findMany({
			where: { modifiedAt: { gte: db.story.fields.synchronizedAt } },
		});
	}),
	search: publicProcedure
		.input(
			z.object({
				query: z.string().optional(),
				limit: z.number().default(50),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ input }) => {
			const isUrl = input.query?.startsWith("http") ?? false;
			return await db.story.findMany({
				take: input.limit,
				skip: input.offset,
				where: {
					title: isUrl ? undefined : { contains: input.query, mode: "insensitive" },
					articles: {
						some: isUrl ? { externalUrl: { contains: input.query } } : undefined,
					},
					status: StoryStatus.PUBLISHED,
				},
				include: {
					_count: { select: { articles: true } },
				},
			});
		}),
	update: publicProcedure
		.input(
			z.object({
				id: objectId("id must be a valid MongoDB ObjectId"),
				title: z.optional(z.string().min(1, "Title is required")),
				summary: z.optional(z.array(z.string()).min(1, "At least one summary is required")),
				cover: z.optional(z.string()),
				status: z.nativeEnum(StoryStatus).optional(),
			}),
		)
		.mutation(async ({ input }) => {
			return await db.story.update({
				where: { id: input.id },
				data: {
					title: input.title,
					summary: input.summary,
					cover: input.cover,
					modifiedAt: new Date(),
					status: input.status,
				},
			});
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
