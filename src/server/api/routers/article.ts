import { z } from "zod"; 
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";  // Import MongoDB ObjectId

export const articleRouter = createTRPCRouter({
  // Create a new article
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().min(1, "Content is required"),
        reporterId: z.string().min(1, "Reporter ID is required"),
        storyId: z.string().min(1, "Story ID is required"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Convert IDs to ObjectId format
        const reporterId = new ObjectId(input.reporterId);
        const storyId = new ObjectId(input.storyId);

        // Validate if the reporter exists
        const reporterExists = await db.reporter.findUnique({
          where: { id: reporterId.toString() },
          select: { id: true },
        });

        if (!reporterExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Reporter with the provided ID does not exist.",
          });
        }

        // Validate if the story exists
        const storyExists = await db.story.findUnique({
          where: { id: storyId.toString() },
          select: { id: true },
        });

        if (!storyExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Story with the provided ID does not exist.",
          });
        }

        // Create the new article
        return await db.article.create({
          data: {
            title: input.title,
            content: input.content,
            reporterId: reporterId.toString(),
            storyId: storyId.toString(),
          },
        });
      } catch (error: any) {
        console.error("Error creating article:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create article.",
        });
      }
    }),

  // Read all articles
  getAll: publicProcedure.query(async () => {
    try {
      return await db.article.findMany({
        include: { reporter: true, story: true, comments: true },
      });
    } catch (error: any) {
      console.error("Error fetching articles:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch articles.",
      });
    }
  }),

  // Get a single article by ID
  getById: publicProcedure
    .input(z.string().min(1, "Article ID is required"))
    .query(async ({ input }) => {
      try {
        const article = await db.article.findUnique({
          where: { id: input },
          include: { reporter: true, story: true, comments: true },
        });

        if (!article) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Article not found.",
          });
        }

        return article;
      } catch (error: any) {
        console.error("Error fetching article by ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch the article.",
        });
      }
    }),

  // Update an article
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Article ID is required"),
        title: z.string().optional(),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      if (!Object.keys(data).length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "At least one field (title or content) must be updated.",
        });
      }

      try {
        const updatedArticle = await db.article.update({
          where: { id },
          data,
        });

        if (!updatedArticle) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Article not found.",
          });
        }

        return updatedArticle;
      } catch (error: any) {
        console.error("Error updating article:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update the article.",
        });
      }
    }),

  // Delete an article
  delete: publicProcedure
    .input(z.string().min(1, "Article ID is required"))
    .mutation(async ({ input }) => {
      try {
        const deletedArticle = await db.article.delete({
          where: { id: input },
        });

        if (!deletedArticle) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Article not found.",
          });
        }

        return deletedArticle;
      } catch (error: any) {
        console.error("Error deleting article:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete the article.",
        });
      }
    }),
});
