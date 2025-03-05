import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { TRPCError } from "@trpc/server";

export const storyRouter = createTRPCRouter({
	create: publicProcedure
		.input(
			z.object({
				title: z.string().min(1, "Title is required"),
				summary: z.array(z.string()).min(1, "Summary is required"),
			}),
		)
		.mutation(async ({ input }) => {
			return db.story.create({
				data: {
					title: input.title,
					summary: input.summary,
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
			}),
		)
		.query(async ({ input }) => {
			return db.story.findMany({
				take: input.limit,
				skip: input.offset,
				orderBy: {
					[input.orderBy]: input.orderDirection,
				},
			});
		}),

	getById: publicProcedure
		.input(
			z.object({
				id: z.string().min(1, "Story ID is required"),
			}),
		)
		.query(async ({ input }) => {
			const story = await db.story.findUnique({
				where: { id: input.id },
				include: { articles: true },
			});

			if (!story) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Story not found.",
				});
			}

			return story;
		}),

	update: publicProcedure
		.input(
			z.object({
				id: z.string().min(1, "Story ID is required"),
				title: z.optional(z.string().min(1, "Title is required")),
				summary: z.optional(z.array(z.string()).min(1, "At least one summary is required")),
			}),
		)
		.mutation(async ({ input }) => {
			const story = await db.story.update({
				where: { id: input.id },
				data: {
					title: input.title,
					summary: input.summary,
					lastUpdated: new Date(),
				},
			});

			return story;
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string().min(1, "Story ID is required") }))
		.mutation(async ({ input }) => {
			return await db.$transaction([
				db.article.deleteMany({ where: { storyId: input.id } }),
				db.story.delete({ where: { id: input.id } }),
			]);
		}),
});
