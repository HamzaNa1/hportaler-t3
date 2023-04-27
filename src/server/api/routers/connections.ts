import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const connectionsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const connections = await ctx.prisma.connection.findMany();
    return connections;
  }),
  create: publicProcedure
    .input(
      z.object({
        from: z.string().min(1).max(50),
        to: z.string().min(1).max(50),
        type: z.enum(["green", "blue", "yellow", "royal"]),
        endAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const connection = await ctx.prisma.connection.create({
        data: {
          from: input.from,
          to: input.to,
          type: input.type,
          endAt: input.endAt,
        },
      });

      return connection;
    }),
});
