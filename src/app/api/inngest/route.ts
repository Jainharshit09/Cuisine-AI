import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { detectIngredients } from '@/lib/inngest/functions/ingredientDetection';
import { generateRecipe } from '@/lib/inngest/functions/recipeGeneration';
import { analyzeNutrition } from '@/lib/inngest/functions/nutritionAnalysis';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [detectIngredients, generateRecipe, analyzeNutrition],
});