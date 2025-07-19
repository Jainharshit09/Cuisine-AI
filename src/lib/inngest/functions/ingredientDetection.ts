// src/inngest/functions/detectIngredients.ts

import { inngest } from '../client';
import axios from 'axios';
import prisma from '../../prisma';
import { promises as fs } from 'fs';
import { NonRetriableError } from 'inngest';

export const detectIngredients = inngest.createFunction(
  { id: 'detect-ingredients' },
  { event: 'ingredient/detect' },
  async ({ event, step }) => {
    const { imageUrl, userId, dishName } = event.data;

    const user = await step.run('check-if-user-exists', () => {
      return prisma.user.findUnique({ where: { clerkId: userId } });
    });

    if (!user) {
      throw new NonRetriableError('User does not exist in database', { cause: { userId } });
    }

    const base64 = await step.run('read-image-file', async () => {
      const buffer = await fs.readFile(imageUrl);
      return buffer.toString('base64');
    });

    // Prepare Gemini Vision API request
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new NonRetriableError('GEMINI_API_KEY is not set');
    }

    // FIX: Corrected the API endpoint for Gemini 1.5 Flash
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
    const prompt = 'List the food ingredients you see in this image. Only return a comma-separated list of ingredient names, with no other text.';

    // FIX: Corrected keys in the request payload to use snake_case
    const geminiRequest = {
      contents: [
        {
          parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: base64 } }],
        },
      ],
    };

    // Call Gemini Vision API
    const geminiRes = await step.run('call-gemini-vision-api', () => {
      return axios.post(geminiEndpoint, geminiRequest);
    });

    // Parse Gemini response
    const candidates = geminiRes.data?.candidates;
    let ingredientList: string[] = [];

    if (Array.isArray(candidates) && candidates.length > 0) {
      const text = candidates[0]?.content?.parts?.map((p: any) => p.text).join(' ') || '';
      ingredientList = text.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    // Only proceed if ingredients were detected
    if (ingredientList.length > 0) {
      // Trigger recipe generation with detected ingredients
      await step.sendEvent('trigger-recipe-generation', {
        name: 'recipe/generate',
        data: {
          ingredients: ingredientList,
          dietaryPrefs: user.dietaryPrefs || {},
          userId: user.clerkId,
          dishName: dishName, // Pass the dish name to recipe generation
        },
      });
      return { ingredients: ingredientList, userId, message: 'Recipe generation triggered' };
    }

    return { ingredients: [], userId, message: 'No ingredients were detected' };
  }
);