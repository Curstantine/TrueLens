import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { TRPCError } from "@trpc/server";

export const reporterRouter = createTRPCRouter({
	// Create
	create: publicProcedure
		.input(
			z.object({
				name: z.string().min(1, "Name is required"),
				email: z.string().email("Invalid email address"),
				outletId: z.string().min(1, "News Outlet ID is required"),
			}),
		)
		.mutation(async ({ input }) => {
			// Ensure email is unique
			const existingReporter = await db.reporter.findUnique({
				where: { email: input.email },
			});
			if (existingReporter) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A reporter with this email already exists.",
				});
			}

			// Check if the News Outlet exists
			const outletExists = await db.newsOutlet.findUnique({
				where: { id: input.outletId },
				select: { id: true },
			});
			if (!outletExists) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "News Outlet with the provided ID does not exist.",
				});
			}

			// Create the reporter
			return await db.reporter.create({
				data: {
					name: input.name,
					email: input.email,
					outletId: input.outletId,
				},
			});
		}),

	//get all reporter
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

	// Get by ID
	getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
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

	// Update by id
	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				email: z.string().email("Invalid email address").optional(),
				outletId: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			// Validate that the ID is a valid MongoDB ObjectId
			if (input.outletId && !/^[a-f\d]{24}$/i.test(input.outletId)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid outletId format. Must be a valid MongoDB ObjectId.",
				});
			}

			// Ensure the reporter exists
			const existingReporter = await db.reporter.findUnique({
				where: { id: input.id },
			});
			if (!existingReporter) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Reporter not found",
				});
			}

			// If outletId is provided, ensure the outlet exists
			if (input.outletId) {
				const outletExists = await db.newsOutlet.findUnique({
					where: { id: input.outletId },
					select: { id: true },
				});
				if (!outletExists) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "News Outlet with the provided ID does not exist.",
					});
				}
			}

			return await db.reporter.update({
				where: { id: input.id },
				data: {
					name: input.name,
					email: input.email,
					outletId: input.outletId,
				},
			});
		}),

	//Delete reporter by id
	delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
		const existingReporter = await db.reporter.findUnique({
			where: { id: input.id },
		});
		if (!existingReporter) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Reporter not found",
			});
		}
		await db.reporter.delete({ where: { id: input.id } });
		return { message: "Reporter deleted successfully" };
	}),
});
