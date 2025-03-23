import { waitlistRouter } from "~/server/api/routers/waitlist";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { articleRouter } from "~/server/api/routers/article";
import { newsOutletRouter } from "~/server/api/routers/newsOutlet";
import { storyRouter } from "~/server/api/routers/story";
import { reporterRouter } from "~/server/api/routers/reporter";
import { commentRouter } from "~/server/api/routers/comment";
import { configurationRouter } from "~/server/api/routers/configuration";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	waitlist: waitlistRouter,
	article: articleRouter,
	newsOutlet: newsOutletRouter,
	story: storyRouter,
	reporter: reporterRouter,
	comment: commentRouter,
	configuration: configurationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
