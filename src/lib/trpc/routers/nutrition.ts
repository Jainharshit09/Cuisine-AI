import { z } from 'zod';
import { publicProcedure, router } from '../server';
import axios from 'axios';

export const nutritionRouter = router({
  analyze: publicProcedure
    .input(z.object({
      ingredients: z.array(z.string()),
      instructions: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not set');
      }

      const prompt = `
You are a professional nutritionist. Given the following list of ingredients, estimate the total nutritional values (for 1 serving). Respond ONLY in raw JSON format, without markdown or extra text:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}

Ingredients:
${input.ingredients.join('\n')}
      `;

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
        const nutrition = extractJSON(text);
        return {
          calories: nutrition.calories || 0,
          protein: nutrition.protein || 0,
          carbs: nutrition.carbs || 0,
          fat: nutrition.fat || 0,
        };
      } catch (err) {
        throw new Error('Failed to analyze nutrition');
      }
    }),
});