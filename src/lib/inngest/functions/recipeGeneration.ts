import { inngest } from '../client';
import prisma from '../../prisma';
import { createAgent, gemini } from '@inngest/agent-kit';
import { NonRetriableError } from 'inngest';

export const generateRecipe = inngest.createFunction(
  { id: 'generate-recipe' },
  { event: 'recipe/generate' },
  async ({ event, step }) => {
    const { ingredients, dietaryPrefs, userId, dishName } = event.data;

    console.log('Recipe generation started:', { ingredients, userId, dishName });

    const user = await step.run('fetch-user-for-recipe', () => {
      return prisma.user.findUnique({ where: { clerkId: userId } });
    });

    if (!user) {
      throw new NonRetriableError('User not found', { cause: { userId } });
    }

    const prompt = `Generate a creative, healthy recipe using these ingredients: ${ingredients.join(', ')}.
Dietary preferences: ${JSON.stringify(dietaryPrefs)}.
Avoid these restrictions: ${JSON.stringify(user.restrictions || [])}.
Return only the cooking instructions as a single block of text, without a title or ingredient list.`;

    const ai = createAgent({
      name: 'Gemini Recipe Chef',
      system: 'You are a professional chef AI who creates clean, delicious recipes.',
      model: gemini({
        apiKey: process.env.GEMINI_API_KEY!,
        model: 'gemini-1.5-flash-latest',
      }),
    });

    const agentResult = await ai.run(prompt);

    const lastMessage = agentResult.output.at(-1);
    let instructions: string;

    if (lastMessage && lastMessage.type === 'text' && typeof lastMessage.content === 'string') {
      instructions = lastMessage.content;
    } else {
      console.error("AI did not return a valid text response.", { lastMessage });
      throw new NonRetriableError("AI did not return a valid text response.");
    }

    // Generate a temporary recipe ID
    const tempRecipeId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('Recipe generated, triggering nutrition analysis');

    // Use your existing step.sendEvent format
    await step.sendEvent('trigger-nutrition-analysis', {
      name: 'nutrition/analyze',
      data: {
        ingredients,
        instructions,
        tempRecipeId,
        userId,
        userDbId: user.id, // Pass the database user ID
        dishName: dishName, // Pass the dish name to nutrition analysis
      },
    });

    return {
      tempRecipeId,
      instructions,
      ingredients,
      userId,
      dishName
    };
  }
);
