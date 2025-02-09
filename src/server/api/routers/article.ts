import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { TRPCError } from "@trpc/server";

export const articleRouter = createTRPCRouter({
  /*
  crate the artical
  api call:http://localhost:3000/api/trpc/article.create
  */
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
        console.log("Received input for article.create:", input);

        // Check if reporter exists
        const reporterExists = await db.reporter.findUnique({
          where: { id: input.reporterId },
          select: { id: true },
        });
        if (!reporterExists) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Reporter not found." });
        }

        // Check if story exists
        const storyExists = await db.story.findUnique({
          where: { id: input.storyId },
          select: { id: true },
        });
        if (!storyExists) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Story not found." });
        }

        // Create the article
        return await db.article.create({ data: input });
      } catch (error) {
        console.error("Error creating article:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create article." });
      }
    }),
/*
get All articles
api call: http://localhost:3000/api/trpc/article.getAll
*/
  getAll: publicProcedure.query(async () => {
    try {
      return await db.article.findMany({ include: { reporter: true, story: true, comments: true } });
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch articles." });
    }
  }),
/* 
get article by id
api call: http://localhost:3000/api/trpc/article.getById?input={"json":{"id":"67a4c66041ba6ab17a00ef85"}}
*/
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1, "Article ID is required") }))
    .query(async ({ input }) => {
      try {
        console.log("Received input for article.getById:", input);

        const article = await db.article.findUnique({
          where: { id: input.id },
          include: { reporter: true, story: true, comments: true },
        });
        if (!article) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Article not found." });
        }
        return article;
      } catch (error) {
        console.error("Error fetching article:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch article." });
      }
    }),
/*
update the data
api call: http://localhost:3000/api/trpc/article.update
*/
    update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "ID is required"), // Ensure ID is provided
        title: z.string().optional(),
        content: z.string().optional(),
        authorId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

        if (!id) {
          throw new Error("Article ID is required");
        }

        // Ensure updateData is not empty
        if (Object.keys(updateData).length === 0) {
          throw new Error("At least one field must be provided for update");
        }

        const updatedArticle = await db.article.update({
          where: { id },
          data: updateData,
        });

        return updatedArticle;
      } catch (error) {
        console.error("Error updating article:", error);
        throw new Error("Failed to update article");
      }
    }),

});
