
import { ingredientRouter } from './ingredient';
import { mealPlanRouter } from './mealPlan';
import { userRouter } from './user';
import { recipeRouter } from './recipe';
import { shoppingListRouter } from './shoppingList';
import { nutritionRouter } from './nutrition';
import { router } from '../server';

export const appRouter = router({
  recipe: recipeRouter,
  ingredient: ingredientRouter,
  mealPlan: mealPlanRouter,
  shoppingList: shoppingListRouter,
  user: userRouter,
  nutrition: nutritionRouter
});

export type AppRouter = typeof appRouter;