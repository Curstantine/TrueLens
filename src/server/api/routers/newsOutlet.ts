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
        return db.newsOutlet.findMany();
      }),
  

      //get news outlet by id
      //@example
      // http://localhost:3000/api/trpc/newsOutlet.getById?input={"json":{"id":"67ab90f882cbf670ef001dc2"}}
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
        return db.newsOutlet.update({
          where: { id: input.id },
          data: {
            name: input.name ?? undefined,
            headquarters: input.headquarters ?? undefined,
          },
        });
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
        await db.newsOutlet.delete({
          where: { id: input.id },
        });
        return { message: "News outlet deleted successfully" };
      }),
});