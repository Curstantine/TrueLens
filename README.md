# TrueLens

## Prerequisites

1. You need pnpm to use this project. Run `corepack enable` in an elevated terminal to enable pnpm.
2. You need to create a .env file similar to the content of [.env.example](./.env.example)
    - Contact me for the MongoDB Atlas URL needed inside the .env file.

## Building

1. `pnpm i` to install dependencies.
2. `pnpm dev` to start both the frontend and the backend.
3. `pnpm format:write` to format the code using prettier.

### Guide (Backend)

Below is a guide on how to do simple things within this project.

#### Creating an endpoint

1. Create a `<route_name>.ts` file inside [routers/](./src/server/api/routers/) folder.
2. Copy the contents of `post.ts` into the newly created `<route_name>.ts` folder and change the options to your liking.
3. Import the `<route_name>.ts` file from the [root.ts](./src/server/api/root.ts) file, and insert the route to the `createTRPCRouter` function.

For an example, say we need to create a user route:

- `src/server/api/routers/user.ts`

    ```tsx
    import {
    	createTRPCRouter,
    	protectedProcedure,
    	publicProcedure,
    } from "~/server/api/trpc";

    export const UserRouter = createTRPCRouter({
    	hello: publicProcedure // <- unauthenticated access
    		.input(z.object({ text: z.string() }))
    		.query(({ input }) => {
    			return {
    				greeting: `Hello ${input.text}`,
    			};
    		}),

    	create: protectedProcedure // <- authenticated access
    		.input(z.object({ name: z.string().min(1) }))
    		.mutation(async ({ ctx, input }) => {
    			return ctx.db.post.create({
    				data: {
    					name: input.name,
    					createdBy: { connect: { id: ctx.session.user.id } },
    				},
    			});
    		}),
    });
    ```

- `src/server/api/root.ts`

    ```tsx
    import { userRouter } from "~/server/api/routers/user";

    export const appRouter = createTRPCRouter({
    	user: userRouter,
    });
    ```

### Additional documentation

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Acknowledgements

This project was bootstrapped with the help of [create.t3](https://create.t3.gg/).
