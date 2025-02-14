import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { TRPCError } from "@trpc/server";

export const storyRouter = createTRPCRouter({
    /* Create Story */
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

    });