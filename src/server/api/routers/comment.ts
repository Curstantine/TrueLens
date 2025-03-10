import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { objectId } from "~/server/validation/mongo";

export const commentRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				content: z.string().min(1, "Comment cannot be empty"),
				storyId: objectId("Story id must be a valid MongoDB ObjectId"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const [story, user] = await Promise.all([
				db.story.findUnique({ where: { id: input.storyId } }),
				db.user.findUnique({ where: { id: ctx.session.user.id } }),
			]);

			if (!story) throw new TRPCError({ code: "NOT_FOUND", message: "Story not found" });
			if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

			return await db.comment.create({
				data: {
					content: input.content,
					storyId: input.storyId,
					userId: ctx.session.user.id,
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
			return await db.comment.findMany({
				take: input.limit,
				skip: input.offset,
				include: { user: true },
			});
		}),
	getById: publicProcedure
		.input(z.object({ id: objectId("id must be a valid MongoDB ObjectId") }))
		.query(async ({ input }) => {
			const comment = await db.comment.findUnique({
				where: { id: input.id },
				include: { user: true },
			});
			if (!comment) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
			}

			return comment;
		}),
	getByStoryId: publicProcedure
		.input(
			z.object({
				storyId: objectId("storyId must be a valid MongoDB ObjectId"),
				limit: z.number().min(1).max(100).default(100),
				offset: z.number().min(0).default(0),
				order: z.enum(["asc", "desc"]).default("desc"),
			}),
		)
		.query(async ({ input }) => {
			const comments = await db.comment.findMany({
				where: { storyId: input.storyId },
				include: { user: true },
				take: input.limit,
				skip: input.offset,
				orderBy: { createdAt: input.order },
			});

			return comments;
		}),
	update: protectedProcedure
		.input(
			z.object({
				id: objectId("id must be a valid MongoDB ObjectId"),
				content: z.string().min(1, "Updated content is required"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const comment = await db.comment.findUnique({ where: { id: input.id } });

			if (!comment) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
			}

			if (comment.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You cannot update this comment",
				});
			}

			return await db.comment.update({
				where: { id: input.id },
				data: { content: input.content, modifiedAt: new Date() },
			});
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string().min(1, "Comment ID is required") }))
		.mutation(async ({ input, ctx }) => {
			const comment = await db.comment.findUnique({ where: { id: input.id } });

			if (!comment) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
			}

			if (comment.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You cannot delete this comment",
				});
			}

			return await db.comment.delete({ where: { id: input.id } });
		}),
});
