import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { TRPCError } from "@trpc/server";

export const newsOutletRouter = createTRPCRouter({
    /* Create newsOutlet   */
    create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        headquarters: z.string().min(1, "Headquarters is required"),
      })
    )
    .mutation(async ({ input }) => {
      return db.newsOutlet.create({
        data: {
          name: input.name,
          headquarters: input.headquarters,
        },
      });
    }),

      //get all news outlets
      
      getAll: publicProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(100),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        return db.newsOutlet.findMany({
          take: input.limit,
          skip: input.offset,
        });
      }),
  
      //get news outlet by id
      getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const newsOutlet = await db.newsOutlet.findUnique({
          where: { id: input.id },
        });
        if (!newsOutlet) {
          throw new TRPCError({ code: "NOT_FOUND", message: "News outlet not found" });
        }
        return newsOutlet;
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
        return db.newsOutlet.update({
          where: { id: input.id },
          data: {
            name: input.name ?? undefined,
            headquarters: input.headquarters ?? undefined,
          },
        });
      }),

      //delete news outlet by id
      delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.newsOutlet.delete({
          where: { id: input.id },
        });
        return { message: "News outlet deleted successfully" };
      }),
});