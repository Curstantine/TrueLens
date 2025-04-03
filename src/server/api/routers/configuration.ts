import { z } from "zod";
import { ConfigurationKey, StoryStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { db } from "~/server/db";
import { objectId } from "~/server/validation/mongo";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const configurationRouter = createTRPCRouter({
	getLastSync: publicProcedure.query(async () => {
		const data = await db.configuration.findUnique({
			where: { key: ConfigurationKey.LAST_SYNC_DATE },
			select: { value: true },
		});

		return new Date(data?.value ?? 0);
	}),
	updateLastSync: adminProcedure
		.input(z.object({ value: z.string().datetime() }))
		.mutation(async ({ input }) => {
			return await db.configuration.update({
				where: { key: ConfigurationKey.LAST_SYNC_DATE },
				data: { value: input.value },
			});
		}),

	getBreakingStoryId: publicProcedure.query(async () => {
		const data = await db.configuration.findUnique({
			where: { key: ConfigurationKey.BREAKING_NEWS_STORY_ID },
			select: { value: true },
		});

		return data?.value;
	}),
	updateBreakingStoryId: adminProcedure
		.input(z.object({ value: objectId("Value must be a valid MongoDB ObjectID") }))
		.mutation(async ({ input }) => {
			const story = await db.story.findUnique({
				where: { id: input.value },
				select: { status: true },
			});

			if (story === null) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Given id is invalid as the story does not exist",
				});
			}

			if (story.status !== StoryStatus.PUBLISHED) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "The story must be published to be used as a breaking news",
				});
			}

			return await db.configuration.update({
				where: { key: ConfigurationKey.BREAKING_NEWS_STORY_ID },
				data: { value: input.value },
			});
		}),
});
