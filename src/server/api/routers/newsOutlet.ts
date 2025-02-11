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
});