import { z } from 'zod';
import { publicProcedure, router } from '../server';
import prisma from '../../prisma';
import { inngest } from '@/lib/inngest/client';

export const recipeRouter = router({
  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        ingredients: z.array(z.string()),
        instructions: z.string(),
        nutrition: z.object({
          calories: z.number(),
          protein: z.number(),
          carbs: z.number(),
          fat: z.number(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new Error('Unauthorized');
      // Find the user by clerkId
      const user = await prisma.user.findUnique({ where: { clerkId: ctx.userId } });
      if (!user) throw new Error('User not found');
      const recipe = await prisma.recipe.create({
        data: {
          title: input.title,
          ingredients: input.ingredients,
          instructions: input.instructions,
          nutrition: input.nutrition,
          userId: user.id,
        },
      });
      await inngest.send({
        name: 'recipe/generate',
        data: { ingredients: input.ingredients, dietaryPrefs: {}, userId: ctx.userId },
      });
      return recipe;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) throw new Error('Unauthorized');
    // Find the user by clerkId
    const user = await prisma.user.findUnique({ where: { clerkId: ctx.userId } });
    if (!user) throw new Error('User not found');
    return prisma.recipe.findMany({ where: { userId: user.id } });
  }),
});