import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { objectId } from "~/server/validation/mongo";

export const reporterRouter = createTRPCRouter({
	create: publicProcedure
		.input(
			z.object({
				name: z.string().min(1, "Name is required"),
				email: z.string().email("Invalid email address"),
				outletId: z.string().min(1, "News Outlet ID is required"),
				avatarUrl: z.string().optional(),
				isSystem: z.boolean().default(false),
			}),
		)
		.mutation(async ({ input }) => {
			const reporter = await db.reporter.findUnique({
				where: { email: input.email },
				select: { id: true },
			});

			if (reporter) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A reporter with this email already exists.",
				});
			}

			const outlet = await db.newsOutlet.findUnique({
				where: { id: input.outletId },
				select: { id: true },
			});

			if (!outlet) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "News outlet with the provided ID does not exist.",
				});
			}

			// Create the reporter
			return await db.reporter.create({
				data: {
					name: input.name,
					email: input.email,
					outletId: input.outletId,
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
		.query(async ({ input }) => {
			return await db.reporter.findMany({
				take: input.limit,
				skip: input.offset,
				include: { outlet: true },
			});
		}),
	getById: publicProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.query(async ({ input }) => {
			const reporter = await db.reporter.findUnique({
				where: { id: input.id },
				include: { outlet: true },
			});

			if (!reporter) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Reporter not found",
				});
			}

			return reporter;
		}),
	update: publicProcedure
		.input(
			z.object({
				id: objectId("id must be a valid MongoDB ObjectId"),
				name: z.string().optional(),
				email: z.string().email("Invalid email address").optional(),
				outletId: objectId("id must be a valid MongoDB ObjectId").optional(),
				avatarUrl: z.string().optional(),
				isSystem: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const reporter = await db.reporter.findUnique({
				where: { id: input.id },
				select: { id: true },
			});

			if (!reporter) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Reporter not found" });
			}

			if (input.outletId) {
				const outlet = await db.newsOutlet.findUnique({
					where: { id: input.outletId },
					select: { id: true },
				});

				if (!outlet) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Outlet with the provided id does not exist.",
					});
				}
			}

			return await db.reporter.update({
				where: { id: input.id },
				data: {
					name: input.name,
					email: input.email,
					outletId: input.outletId,
					avatarUrl: input.avatarUrl,
					isSystem: input.isSystem,
				},
			});
		}),
	delete: publicProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.mutation(async ({ input }) => {
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
