import { inngest } from '../client';
import axios from 'axios';
import prisma from '../../prisma';
import { NonRetriableError } from 'inngest';

export const analyzeNutrition = inngest.createFunction(
  { id: 'analyze-nutrition' },
  { event: 'nutrition/analyze' },
  async ({ event, step }) => {
    const { ingredients, instructions, tempRecipeId, userId, userDbId, dishName } = event.data;

    console.log('Nutrition analysis started:', { tempRecipeId, userId, dishName });

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      throw new NonRetriableError('GEMINI_API_KEY is not set');
    }

    try {
      const prompt = `
You are a professional nutritionist. Given the following list of ingredients, estimate the total nutritional values (for 1 serving). Respond ONLY in raw JSON format, without markdown or extra text:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}

Ingredients:
${ingredients.join('\n')}
      `;

      const geminiResponse = await step.run('call-gemini-api', async () => {
        const result = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              topK: 20,
              topP: 0.8,
              maxOutputTokens: 256,
            }
          },
          {
            params: { key: geminiApiKey },
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const text = result.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        function extractJSON(text: string): any {
          const match = text.match(/\{[\s\S]*?\}/);
          if (!match) throw new Error('No valid JSON found in Gemini response');
          return JSON.parse(match[0]);
        }

        try {
          return extractJSON(text);
        } catch (err) {
          throw new NonRetriableError('Gemini returned invalid JSON', { cause: text });
        }
      });

      const nutrition = {
        calories: geminiResponse.calories || 0,
        protein: geminiResponse.protein || 0,
        carbs: geminiResponse.carbs || 0,
        fat: geminiResponse.fat || 0,
      };

      console.log('Nutrition calculated by Gemini:', nutrition);

      // Generate recipe title if not provided
      let recipeTitle = dishName;
      if (!recipeTitle) {
        recipeTitle = await step.run('generate-recipe-title', async () => {
          const titlePrompt = `Based on these ingredients: ${ingredients.join(', ')}, suggest a creative and appetizing recipe name. Return only the name, nothing else.`;

          const titleResult = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
            {
              contents: [{ parts: [{ text: titlePrompt }] }],
              generationConfig: {
                temperature: 0.7,
                topK: 20,
                topP: 0.8,
                maxOutputTokens: 64,
              }
            },
            {
              params: { key: geminiApiKey },
              headers: { 'Content-Type': 'application/json' },
            }
          );

          const titleText = titleResult.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          return titleText?.trim() || 'AI Generated Recipe';
        });
      }

      const savedRecipe = await step.run('save-complete-recipe', () => {
        return prisma.recipe.create({
          data: {
            title: recipeTitle,
            ingredients,
            instructions,
            nutrition,
            userId: userDbId,
            // recipeId: savedRecipe.id, // Will be added after migration
          },
        });
      });

      console.log('Recipe saved with Gemini nutrition data:', { recipeId: savedRecipe.id, title: recipeTitle });

      // Add ingredients to shopping list
      await step.run('add-ingredients-to-shopping-list', async () => {
        // Get today's shopping list or create a new one
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let existingList = await prisma.shoppingList.findFirst({
          where: {
            userId: userDbId,
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
              userId: userDbId,
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
        recipeGroups[savedRecipe.id] = {
          recipeId: savedRecipe.id,
          recipeTitle: recipeTitle,
          items: ingredients
        };

        // Convert back to flat structure for storage
        const updatedItems = Object.values(recipeGroups).flatMap((group: any) =>
          group.items.map((item: string) => ({
            recipeId: group.recipeId,
            recipeTitle: group.recipeTitle,
            ingredient: item
          }))
        );

        await prisma.shoppingList.update({
          where: { id: existingList.id },
          data: { items: updatedItems }
        });

        console.log('Ingredients added to recipe-based shopping list:', {
          listId: existingList.id,
          recipeId: savedRecipe.id,
          recipeTitle: recipeTitle,
          newItemsCount: ingredients.length,
          totalGroups: Object.keys(recipeGroups).length
        });
      });

      return {
        recipe: savedRecipe,
        nutrition,
        tempRecipeId,
        userId,
      };

    } catch (error: any) {
      console.error('Nutrition analysis with Gemini failed', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        payload: {
          ingredientList: ingredients.join('\n'),
          tempRecipeId,
          userId,
        },
      });

      throw new NonRetriableError('Failed to analyze nutrition with Gemini', {
        cause: error.response?.data || error.message,
      });
    }
  }
);
