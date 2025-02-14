import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { TRPCError } from "@trpc/server";

export const storyRouter = createTRPCRouter({
    /* Create Story
    * api address = http://localhost:3000/api/trpc/story.create
    */
    create: publicProcedure
      .input(
        z.object({
          title: z.string().min(1, "Title is required"),
          description: z.string().min(1, "Description is required"),
        })
      )
      .mutation(async ({ input }) => {
        return db.story.create({
          data: {
            title: input.title,
            description: input.description,
          },
        });
      }),

      //get all stories
      //api address= http://localhost:3000/api/trpc/story.getAll
      getAll: publicProcedure.query(() => {
        return db.story.findMany({
          include: { articles: true },
        });
      }),

      //get story by id
      //@example
      //api address = http://localhost:3000/api/trpc/story.getById?input={"json":{"id":"67ab90f882cbf670ef001dc2"}}
      getById: publicProcedure
      .input(
        z.object({
          id: z.string().min(1, "Story ID is required"),
        })
      )
      .query(async ({ input }) => {
          const story = await db.story.findUnique({
          where: { id: input.id },
          include: { articles: true },
        });

        if (!story) {
         throw new TRPCError({
           code: "NOT_FOUND",
           message: "Story not found.",
          });
       }

        return story;
      }),

    //update story by id
    //@example
    //api address= http://localhost:3000/api/trpc/story.update
    update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Story ID is required"),
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
      })
    )
    .mutation(async ({ input }) => {
      const story = await db.story.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
        },
      });

      return story;
    }),

    //delete story by id
    /* Delete story 
    *api address= http://localhost:3000/api/trpc/story.delete
    */
    delete: publicProcedure
    .input(z.object({ id: z.string().min(1, "Story ID is required") })) 
    .mutation(async ({ input }) => {
      return db.story.delete({
        where: { id: input.id }, 
      });
    }),
    
    });