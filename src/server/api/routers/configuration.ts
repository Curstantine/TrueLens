import { z } from "zod";
import { ConfigurationKey } from "@prisma/client";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { db } from "~/server/db";

export const configurationRouter = createTRPCRouter({
	getLastSync: adminProcedure.query(async () => {
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
});
