import { waitlistRouter } from "~/server/api/routers/waitlist";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { articleRouter } from "./routers/article";
import { newsOutletRouter } from "./routers/newsOutlet";
import { storyRouter } from "./routers/story";
import { reporterRouter } from "./routers/reporter";
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
	reporter:reporterRouter,
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
