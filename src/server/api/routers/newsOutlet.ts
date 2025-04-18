import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { objectId } from "~/server/validation/mongo";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const newsOutletRouter = createTRPCRouter({
	create: adminProcedure
		.input(
			z.object({
				name: z.string().min(1, "Name is required"),
				url: z.string().url(),
				logoUrl: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx: { db } }) => {
			const outlet = await db.newsOutlet.findUnique({
				where: { name: input.name },
				select: { id: true },
			});

			if (outlet) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A news outlet with this name already exists.",
					cause: { outletId: outlet.id },
				});
			}

			return await db.newsOutlet.create({
				data: {
					name: input.name,
					url: input.url,
					logoUrl: input.logoUrl,
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
			const [total, data] = await db.$transaction([
				db.newsOutlet.count(),
				db.newsOutlet.findMany({
					take: input.limit,
					skip: input.offset,
					select: {
						id: true,
						name: true,
						logoUrl: true,
						url: true,
						createdAt: true,
						totalFactuality: true,
						_count: { select: { articles: true } },
					},
				}),
			]);

			const docs = data.map((x) => {
				const credibility = Math.round((x.totalFactuality / x._count.articles) * 100);
				// @ts-expect-error We need to remove this property
				delete x.totalFactuality;

				return { ...x, credibility } as Omit<typeof x, "totalFactuality"> & {
					credibility: number;
				};
			});

			docs.sort((a, b) => b.credibility - a.credibility);

			return { total, docs };
		}),
	getById: publicProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.query(async ({ input, ctx: { db } }) => {
			const outlet = await db.newsOutlet.findUnique({ where: { id: input.id } });
			if (!outlet) {
				throw new TRPCError({ code: "NOT_FOUND", message: "News outlet not found" });
			}

			return outlet;
		}),
	getByUrl: publicProcedure
		.input(z.object({ url: z.string().url() }))
		.query(async ({ input, ctx: { db } }) => {
			const outlet = await db.newsOutlet.findUnique({ where: { url: input.url } });
			if (!outlet) {
				throw new TRPCError({ code: "NOT_FOUND", message: "News outlet not found" });
			}

			return outlet;
		}),
	update: adminProcedure
		.input(
			z.object({
				id: objectId("id must be a valid MongoDB ObjectId"),
				name: z.string().optional(),
				url: z.string().url().optional(),
				logoUrl: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx: { db } }) => {
			return await db.newsOutlet.update({
				where: { id: input.id },
				data: {
					name: input.name,
					url: input.url,
					logoUrl: input.logoUrl,
				},
			});
		}),

	delete: adminProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.mutation(async ({ input, ctx: { db } }) => {
			return await db.$transaction([
				db.newsOutlet.delete({ where: { id: input.id } }),
				db.article.deleteMany({ where: { outletId: input.id } }),
			]);
		}),
});
