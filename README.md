# TrueLens

## Prerequisites

1. You need pnpm to use this project. Run `corepack enable` in an elevated terminal to enable pnpm.
2. You need to create a .env file similar to the content of [.env.example](./.env)
    - Contact me for the MongoDB Atlas URL needed inside the .env file.
3. You need `python@^3.13.2` to run the analyzer.
4. Install `pipenv` by `pip install --user pipenv`

## Building

1. `pnpm i` and `pipenv install` to install dependencies.
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
    import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

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

### Endpoints and Documentation

The backend ships a trpc-ui instance when the `NODE_ENV` is `development`. You can access this at the `/api/mock` path. E.g. [http://localhost:3000/api/mock](http://localhost:3000/api/mock)

### Guide (Schema)

- Database schema resides in the [`prisma/schema.prisma`](./prisma/schema.prisma) file.
- After doing changes to the schema file, run `pnpm db:push` to update the changes and generate the necessary types. Be careful when running this in a production deployment.

### Additional documentation

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Acknowledgements

This project was bootstrapped with the help of [create.t3](https://create.t3.gg/).
