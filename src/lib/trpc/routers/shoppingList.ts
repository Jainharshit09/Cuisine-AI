import { z } from 'zod';
import { publicProcedure, router } from '../server';
import prisma from '../../prisma';

export const shoppingListRouter = router({
  create: publicProcedure
    .input(z.object({ items: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new Error('Unauthorized');
      // Find the user by clerkId
      const user = await prisma.user.findUnique({ where: { clerkId: ctx.userId } });
      if (!user) throw new Error('User not found');
      return prisma.shoppingList.create({
        data: {
          userId: user.id,
          items: input.items,
        },
      });
    }),
  addItems: publicProcedure
    .input(z.object({
      items: z.union([
        z.array(z.string()),
        z.array(z.object({
          recipeId: z.string().optional(),
          recipeTitle: z.string().optional(),
          ingredient: z.string()
        }))
      ]),
      recipeTitle: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new Error('Unauthorized');
      // Find the user by clerkId
      const user = await prisma.user.findUnique({ where: { clerkId: ctx.userId } });
      if (!user) throw new Error('User not found');

      // Get the most recent shopping list or create a new one
      const existingList = await prisma.shoppingList.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });

      if (existingList) {
        // Add new items to existing list, avoiding duplicates
        const currentItems = Array.isArray(existingList.items) ? existingList.items : [];

        // Handle both string arrays and object arrays
        let newItems;
        if (Array.isArray(input.items) && input.items.length > 0 && typeof input.items[0] === 'string') {
          // String array - convert to object format
          newItems = (input.items as string[]).map(item => ({
            ingredient: item,
            recipeId: 'ungrouped',
            recipeTitle: 'Other Items'
          }));
        } else {
          // Object array - use as is
          newItems = input.items as any[];
        }

        // Merge current and new items, avoiding duplicates
        const allItems = [...currentItems];
        newItems.forEach(newItem => {
          const exists = allItems.some(item =>
            (typeof item === 'string' && item === newItem.ingredient) ||
            (typeof item === 'object' && item.ingredient === newItem.ingredient)
          );
          if (!exists) {
            allItems.push(newItem);
          }
        });

        return prisma.shoppingList.update({
          where: { id: existingList.id },
          data: { items: allItems }
        });
      } else {
        // Create new shopping list
        let itemsToStore;
        if (Array.isArray(input.items) && input.items.length > 0 && typeof input.items[0] === 'string') {
          // String array - convert to object format
          itemsToStore = (input.items as string[]).map(item => ({
            ingredient: item,
            recipeId: 'ungrouped',
            recipeTitle: 'Other Items'
          }));
        } else {
          // Object array - use as is
          itemsToStore = input.items as any[];
        }

        return prisma.shoppingList.create({
          data: {
            userId: user.id,
            items: itemsToStore,
          },
        });
      }
    }),
  addRecipeItems: publicProcedure
    .input(z.object({
      recipeId: z.string(),
      recipeTitle: z.string(),
      items: z.array(z.string())
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new Error('Unauthorized');
      // Find the user by clerkId
      const user = await prisma.user.findUnique({ where: { clerkId: ctx.userId } });
      if (!user) throw new Error('User not found');

      // Get today's shopping list or create a new one
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let existingList = await prisma.shoppingList.findFirst({
        where: {
          userId: user.id,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!existingList) {
        // Create new shopping list for today
        existingList = await prisma.shoppingList.create({
          data: {
            userId: user.id,
            items: [],
          },
        });
      }

      // Get current items and organize by recipe
      const currentItems = Array.isArray(existingList.items) ? existingList.items : [];

      // Create recipe-based structure
      const recipeGroups = currentItems.reduce((acc: any, item: any) => {
        if (typeof item === 'object' && item.recipeId) {
          if (!acc[item.recipeId]) {
            acc[item.recipeId] = {
              recipeId: item.recipeId,
              recipeTitle: item.recipeTitle,
              items: []
            };
          }
          acc[item.recipeId].items.push(item.ingredient);
        } else {
          // Handle legacy items (plain strings)
          if (!acc['ungrouped']) {
            acc['ungrouped'] = {
              recipeId: 'ungrouped',
              recipeTitle: 'Other Items',
              items: []
            };
          }
          acc['ungrouped'].items.push(item);
        }
        return acc;
      }, {});

      // Add new recipe items
      recipeGroups[input.recipeId] = {
        recipeId: input.recipeId,
        recipeTitle: input.recipeTitle,
        items: input.items
      };

      // Convert back to flat structure for storage
      const updatedItems = Object.values(recipeGroups).flatMap((group: any) =>
        group.items.map((item: string) => ({
          recipeId: group.recipeId,
          recipeTitle: group.recipeTitle,
          ingredient: item
        }))
      );

      return prisma.shoppingList.update({
        where: { id: existingList.id },
        data: { items: updatedItems }
      });
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) throw new Error('Unauthorized');
    // Find the user by clerkId
    const user = await prisma.user.findUnique({ where: { clerkId: ctx.userId } });
    if (!user) throw new Error('User not found');
    return prisma.shoppingList.findMany({ where: { userId: user.id } });
  }),
});