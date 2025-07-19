import { z } from 'zod';
import { publicProcedure, router } from '../server';
import prisma from '../../prisma';

export const userRouter = router({
  updateProfile: publicProcedure
    .input(
      z.object({
        dietaryPrefs:z.object({}).optional(), // ✅ clean, future-proof
        restrictions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new Error('Unauthorized');
      return prisma.user.update({
        where: { clerkId: ctx.userId },
        data: {
          dietaryPrefs: input.dietaryPrefs,
          restrictions: input.restrictions,
        },
      });
    }),
  getProfile: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) throw new Error('Unauthorized');
    return prisma.user.findUnique({ where: { clerkId: ctx.userId } });
  }),
});