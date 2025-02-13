import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { TRPCError } from "@trpc/server";

export const newsOutletRouter = createTRPCRouter({
    /* Create newsOutlet
    *  http://localhost:3000/api/trpc/newsOutlet.create
    *  @example
    *    {
    *    "json": {
    *       "name": "Sakthi News",
    *       "headquarters": "Sakthi TV"
    *   }
    *   }
    */
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
      //@example
      // http://localhost:3000/api/trpc/newsOutlet.getAll
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
      //@example
      // http://localhost:3000/api/trpc/newsOutlet.getById?input={"json":{"id":"67ab90f882cbf670ef001dc2"}}
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
      // http://localhost:3000/api/trpc/newsOutlet.update
      //@example
      /*
      *{
      *"json":{
      *"id": "67ab90f882cbf670ef001dc2",
      *"name": "Updated News Outlet Name",
      *"headquarters": "Updated Headquarters Location"
      *}
      *}
      */
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
      // http://localhost:3000/api/trpc/newsOutlet.delete
      //@example
      /*
      *{
      *"json":{
      *"id":"67ab90f882cbf670ef001dc2"
      *}
      *}
      */
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