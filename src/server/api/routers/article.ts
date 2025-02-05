import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { TRPCError } from "@trpc/server";

export const articleRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().min(1, "Content is required"),
        reporterId: z.string().min(1, "Reporter ID is required"),
        storyId: z.string().min(1, "Story ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Log the incoming input
        console.log("Received input for article.create:", input);

        // Check if input is defined and contains the necessary fields
        if (!input || !input.title || !input.content || !input.reporterId || !input.storyId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing required fields: title, content, reporterId, or storyId.",
          });
        }

        // Check if reporter exists
        const reporterExists = await db.reporter.findUnique({
          where: { id: input.reporterId },
          select: { id: true },
        });

        if (!reporterExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Reporter with the provided ID does not exist.",
          });
        }

        // Check if story exists
        const storyExists = await db.story.findUnique({
          where: { id: input.storyId },
          select: { id: true },
        });

        if (!storyExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Story with the provided ID does not exist.",
          });
        }

        // Create the article
        const article = await db.article.create({
          data: {
            title: input.title,
            content: input.content,
            reporterId: input.reporterId,
            storyId: input.storyId,
          },
        });

        console.log("Article created successfully:", article);
        return article;

      } catch (error) {
        console.error("Error creating article:", error);

        // Enhanced error handling
        if (error instanceof TRPCError) {
          throw error; // rethrow known errors
        } else {
          // Handle unexpected errors
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `An unexpected error occurred: ${ error}`,
          });
        }
      }
    }),

  // Fetch all articles
  getAll: publicProcedure.query(async () => {
    try {
      return await db.article.findMany({
        include: { reporter: true, story: true, comments: true },
      });
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch articles.",
      });
    }
  }),

  // Fetch a single article by ID
  getById: publicProcedure
    .input(z.string().min(1, "Article ID is required"))
    .query(async ({ ctx, input }) => {
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
      } catch (error) {
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
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Ensure at least one field is being updated
      if (Object.keys(data).length === 0) {
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

        return updatedArticle;
      } catch (error) {
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
    .mutation(async ({ ctx, input }) => {
      try {
        return await db.article.delete({
          where: { id: input },
        });
      } catch (error) {
        console.error("Error deleting article:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete the article.",
        });
      }
    }),
});
