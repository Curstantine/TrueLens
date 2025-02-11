import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { TRPCError } from "@trpc/server";

export const newsOutletRouter = createTRPCRouter({
    // Create news outlet
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          headquarters: z.string().min(1, "Headquarters is required"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const newsOutlet = await db.newsOutlet.create({
            data: {
              name: input.name,
              headquarters: input.headquarters,
            },
          });
          return newsOutlet;
        } catch (error) {
          console.error("Error creating news outlet:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create news outlet",
          });
        }
      }),

      //get all news outlets
      getAll: publicProcedure.query(async () => {
        try {
          return await db.newsOutlet.findMany();
        } catch (error) {
          console.error("Error fetching news outlets:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch news outlets",
          });
        }
      }),

      //get news outlet by id
      getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          const newsOutlet = await db.newsOutlet.findUnique({
            where: { id: input.id },
          });
          if (!newsOutlet) {
            throw new TRPCError({ code: "NOT_FOUND", message: "News outlet not found" });
          }
          return newsOutlet;
        } catch (error) {
          console.error("Error fetching news outlet:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch news outlet",
          });
        }
      }),

      //update news outlet by id
      update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          headquarters: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const updatedNewsOutlet = await db.newsOutlet.update({
            where: { id: input.id },
            data: {
              name: input.name,
              headquarters: input.headquarters,
            },
          });
          return updatedNewsOutlet;
        } catch (error) {
          console.error("Error updating news outlet:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update news outlet",
          });
        }
      }),

      //delete news outlet by id
      delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await db.newsOutlet.delete({
            where: { id: input.id },
          });
          return { message: "News outlet deleted successfully" };
        } catch (error) {
          console.error("Error deleting news outlet:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete news outlet",
          });
        }
      }),
});