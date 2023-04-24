import { createTRPCRouter } from "~/server/api/trpc";
import { connectionsRouter } from "./routers/connections";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  connections: connectionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
