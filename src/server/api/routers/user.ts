import { UserRole } from "@prisma/client";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
	getAll: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(100),
				offset: z.number().min(0).default(0),
				role: z.nativeEnum(UserRole).optional(),
				orderBy: z.enum(["createdAt", "name"]).default("createdAt"),
				orderDirection: z.enum(["asc", "desc"]).default("desc"),
			}),
		)
		.query(async ({ input, ctx }) => {
			return await ctx.db.user.findMany({
				take: input.limit,
				skip: input.offset,
				orderBy: { [input.orderBy]: input.orderDirection },
				select: {
					id: true,
					name: true,
					createdAt: true,
					email: true,
					role: true,
					image: true,
				},
			});
		}),
});
