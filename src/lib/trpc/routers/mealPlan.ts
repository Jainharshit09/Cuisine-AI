import { z } from 'zod';
import { publicProcedure, router } from '../server';
import prisma from '../../prisma';

export const mealPlanRouter = router({
  create: publicProcedure
    .input(
      z.object({
        date: z.iso.datetime(),
        meals: z.array(z.object({
          id: z.string(),
          time: z.enum(['breakfast', 'snack', 'lunch', 'dinner']),
          title: z.string(),
          ingredients: z.array(z.string()),
          instructions: z.string().optional(),
          nutrition: z.object({
            calories: z.number(),
            protein: z.number(),
            carbs: z.number(),
            fat: z.number(),
          }),
          recipeId: z.string().optional(),
          isCustom: z.boolean(),
        })),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new Error('Unauthorized');
      // Find the user by clerkId
      const user = await prisma.user.findUnique({ where: { clerkId: ctx.userId } });
      if (!user) throw new Error('User not found');

      // Check if meal plan already exists for this date
      const existingPlan = await prisma.mealPlan.findFirst({
        where: {
          userId: user.id,
          date: new Date(input.date)
        }
      });

      if (existingPlan) {
        // Update existing meal plan - using recipes field
        const existingMeals = Array.isArray(existingPlan.recipes as any) ? (existingPlan.recipes as any) : [];
        const updatedMeals = [...existingMeals, ...input.meals];

        return prisma.mealPlan.update({
          where: { id: existingPlan.id },
          data: { recipes: updatedMeals }
        });
      } else {
        // Create new meal plan - using recipes field
        return prisma.mealPlan.create({
          data: {
            userId: user.id,
            date: new Date(input.date),
            recipes: input.meals,
          },
        });
      }
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) throw new Error('Unauthorized');
    // Find the user by clerkId
    const user = await prisma.user.findUnique({ where: { clerkId: ctx.userId } });
    if (!user) throw new Error('User not found');
    return prisma.mealPlan.findMany({ where: { userId: user.id } });
  }),
  getByDate: publicProcedure
    .input(z.object({ date: z.iso.datetime() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.userId) throw new Error('Unauthorized');
      // Find the user by clerkId
      const user = await prisma.user.findUnique({ where: { clerkId: ctx.userId } });
      if (!user) throw new Error('User not found');

      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      return prisma.mealPlan.findFirst({
        where: {
          userId: user.id,
          date: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      });
    }),
});