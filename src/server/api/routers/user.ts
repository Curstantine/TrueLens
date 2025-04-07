import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { type Prisma, UserRole } from "@prisma/client";

import { objectId } from "~/server/validation/mongo";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
	getById: adminProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.query(async ({ input, ctx }) => {
			const user = await ctx.db.user.findUnique({ where: { id: input.id } });
			if (!user) {
				throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
			}

			return user;
		}),
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
			const where: Prisma.UserWhereInput = { role: input.role };
			const [total, docs] = await ctx.db.$transaction([
				ctx.db.user.count({ where }),
				ctx.db.user.findMany({
					take: input.limit,
					skip: input.offset,
					where,
					select: {
						id: true,
						name: true,
						createdAt: true,
						email: true,
						role: true,
						image: true,
					},
					orderBy: {
						[input.orderBy]: input.orderDirection,
					},
				}),
			]);

			return { docs, total };
		}),
	changeRole: adminProcedure
		.input(
			z.object({
				id: objectId("id must be a valid MongoDB ObjectId"),
				role: z.nativeEnum(UserRole),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return ctx.db.user.update({
				where: { id: input.id },
				data: { role: input.role },
			});
		}),
});
