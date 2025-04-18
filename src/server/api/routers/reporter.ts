import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { objectId } from "~/server/validation/mongo";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const reporterRouter = createTRPCRouter({
	create: adminProcedure
		.input(
			z.object({
				name: z.string().min(1, "Name is required"),
				email: z.string().email("Invalid email address"),
				avatarUrl: z.string().optional(),
				isSystem: z.boolean().default(false),
			}),
		)
		.mutation(async ({ input, ctx: { db } }) => {
			const reporter = await db.reporter.findUnique({
				where: { email: input.email },
				select: { id: true },
			});

			if (reporter) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A reporter with this email already exists.",
					cause: { reporterId: reporter.id },
				});
			}

			return await db.reporter.create({
				data: {
					name: input.name,
					email: input.email,
					avatarUrl: input.avatarUrl,
					isSystem: input.isSystem,
				},
			});
		}),
	getAll: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(100),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ input, ctx: { db } }) => {
			return await db.reporter.findMany({
				take: input.limit,
				skip: input.offset,
			});
		}),
	getById: publicProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.query(async ({ input, ctx: { db } }) => {
			const reporter = await db.reporter.findUnique({ where: { id: input.id } });

			if (!reporter) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Reporter not found",
				});
			}

			return reporter;
		}),
	update: adminProcedure
		.input(
			z.object({
				id: objectId("id must be a valid MongoDB ObjectId"),
				name: z.string().optional(),
				email: z.string().email("Invalid email address").optional(),
				avatarUrl: z.string().optional(),
				isSystem: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx: { db } }) => {
			const reporter = await db.reporter.findUnique({
				where: { id: input.id },
				select: { id: true },
			});

			if (!reporter) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Reporter not found" });
			}

			return await db.reporter.update({
				where: { id: input.id },
				data: {
					name: input.name,
					email: input.email,
					avatarUrl: input.avatarUrl,
					isSystem: input.isSystem,
				},
			});
		}),
	delete: adminProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.mutation(async ({ input, ctx: { db } }) => {
			const reporter = await db.reporter.findUnique({
				where: { id: input.id },
				select: { id: true },
			});

			if (!reporter) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Reporter not found" });
			}

			return await db.$transaction([
				db.article.deleteMany({ where: { reporterId: input.id } }),
				db.reporter.delete({ where: { id: input.id } }),
			]);
		}),
});
