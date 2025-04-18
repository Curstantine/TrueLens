import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { type Article, ConfigurationKey, type Prisma, StoryStatus } from "@prisma/client";

import { objectId } from "~/server/validation/mongo";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

function calculateStoryFactuality<T extends { articles: Pick<Article, "factuality">[] }>(x: T) {
	const total = x.articles.reduce((a, y) => (a += y.factuality), 0);
	const len = x.articles.length;

	// @ts-expect-error we want to remove the property regardless
	delete x.articles;

	return {
		...x,
		factuality: Math.round((total / len) * 100),
		articleCount: len,
	} as Omit<typeof x, "articles"> & Record<"factuality" | "articleCount", number>;
}

export const storyRouter = createTRPCRouter({
	create: adminProcedure
		.input(
			z.object({
				title: z.string().min(1, "Title is required"),
				summary: z.array(z.string()).min(1, "Summary is required"),
				cover: z.optional(z.string()),
			}),
		)
		.mutation(async ({ input, ctx: { db } }) => {
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
				includeBreakingNews: z.boolean().default(false),
			}),
		)
		.query(async ({ input, ctx: { db } }) => {
			let breakingNewsId: string | null = null;
			if (!input.includeBreakingNews) {
				const resp = await db.configuration.findUnique({
					where: { key: ConfigurationKey.BREAKING_NEWS_STORY_ID },
					select: { value: true },
				});

				breakingNewsId = resp?.value ?? null;
			}

			const where: Prisma.StoryWhereInput = {
				id: !breakingNewsId ? undefined : { not: breakingNewsId },
				status: input.status !== null ? input.status : undefined,
			};

			const [total, data] = await db.$transaction([
				db.story.count({ where }),
				db.story.findMany({
					take: input.limit,
					skip: input.offset,
					where,
					select: {
						id: true,
						title: true,
						cover: true,
						status: true,
						createdAt: true,
						modifiedAt: true,
						articles: { select: { factuality: true } },
					},
					orderBy: {
						[input.orderBy]: input.orderDirection,
					},
				}),
			]);

			const docs = data.map(calculateStoryFactuality);
			return { docs, total };
		}),
	approveStory: adminProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.mutation(async ({ input, ctx: { db } }) => {
			return await db.story.update({
				where: { id: input.id },
				data: { status: StoryStatus.PUBLISHED },
			});
		}),
	getByIdReduced: publicProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.query(async ({ input, ctx: { db } }) => {
			const story = await db.story.findUnique({
				where: { id: input.id },
				select: {
					id: true,
					title: true,
					cover: true,
					articles: { select: { factuality: true } },
				},
			});

			if (!story) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Story not found" });
			}

			return calculateStoryFactuality(story);
		}),
	getById: publicProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.query(async ({ input, ctx: { db } }) => {
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

			let totalScore = 0;
			const outlets = [];

			for (let i = 0; i < story.articles.length; i++) {
				const article = story.articles[i]!;
				totalScore += article.factuality;

				const outletIndex = outlets.findIndex((x) => x.id === article.outlet.id);
				if (outletIndex !== -1) {
					outlets[outletIndex]!.publicationCount++;
					outlets[outletIndex]!.credibility += article.factuality;

					continue;
				}

				outlets.push({
					id: article.outlet.id,
					name: article.outlet.name,
					logoUrl: article.outlet.logoUrl,
					credibility: article.factuality,
					publicationCount: 1,
				});
			}

			const outletRanking = outlets
				.sort((a, b) => b.credibility - a.credibility)
				.map((x) => ({
					...x,
					credibility: Math.round((x.credibility * 100) / x.publicationCount),
				}));

			return {
				...story,
				outletRanking,
				factuality: Math.round((totalScore * 100) / story.articles.length),
			};
		}),
	getAllOutOfSync: adminProcedure.query(async ({ ctx: { db } }) => {
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
		.query(async ({ input, ctx: { db } }) => {
			const isUrl = input.query?.startsWith("http") ?? false;
			const data = await db.story.findMany({
				take: input.limit,
				skip: input.offset,
				where: {
					title: isUrl ? undefined : { contains: input.query, mode: "insensitive" },
					articles: {
						some: isUrl ? { externalUrl: { contains: input.query } } : undefined,
					},
					status: StoryStatus.PUBLISHED,
				},
				select: {
					id: true,
					title: true,
					cover: true,
					articles: { select: { factuality: true } },
				},
			});

			return data.map(calculateStoryFactuality);
		}),
	update: adminProcedure
		.input(
			z.object({
				id: objectId("id must be a valid MongoDB ObjectId"),
				title: z.optional(z.string().min(1, "Title is required")),
				summary: z.optional(z.array(z.string()).min(1, "At least one summary is required")),
				cover: z.optional(z.string()),
				status: z.nativeEnum(StoryStatus).optional(),
			}),
		)
		.mutation(async ({ input, ctx: { db } }) => {
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

	delete: adminProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.mutation(async ({ input, ctx: { db } }) => {
			return await db.$transaction(async (tx) => {
				const articles = await tx.article.findMany({
					where: { storyId: input.id },
					select: {
						id: true,
						factuality: true,
						outlet: { select: { id: true, totalFactuality: true } },
					},
				});

				const factualityMapping = articles.reduce(
					(acc, x) => {
						acc[x.outlet.id] ??= x.outlet.totalFactuality;
						if (x.outlet.id in acc) acc[x.outlet.id]! -= x.factuality;
						return acc;
					},
					{} as Record<string, number>,
				);

				const entries = Object.entries(factualityMapping);
				const actions = <Promise<unknown>[]>[];

				for (let i = 0; i < entries.length; i++) {
					const [key, value] = entries[i]!;
					const action = tx.newsOutlet.update({
						where: { id: key },
						data: { totalFactuality: value },
					});

					actions.push(action);
				}

				await Promise.all([
					actions,
					tx.article.deleteMany({ where: { storyId: input.id } }),
					tx.comment.deleteMany({ where: { storyId: input.id } }),
				]);

				return await tx.story.delete({ where: { id: input.id } });
			});
		}),
});
