import { z } from "zod";
import { ConfigurationKey } from "@prisma/client";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const configurationRouter = createTRPCRouter({
	getLastSync: publicProcedure.query(async () => {
		const data = await db.configuration.findUnique({
			where: { key: ConfigurationKey.LAST_SYNC_DATE },
			select: { value: true },
		});

		return new Date(data?.value ?? 0);
	}),

	updateLastSync: publicProcedure
		.input(z.object({ value: z.string().datetime() }))
		.mutation(async ({ input }) => {
			return await db.configuration.update({
				where: { key: ConfigurationKey.LAST_SYNC_DATE },
				data: { value: input.value },
			});
		}),
});
