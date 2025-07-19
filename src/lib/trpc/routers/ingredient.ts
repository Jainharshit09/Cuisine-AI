import { z } from 'zod';

import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';


import { publicProcedure, router } from '../server';
import { inngest } from '@/lib/inngest/client';

export const ingredientRouter = router({
  uploadImage: publicProcedure
    .input(z.object({
      image: z.string(),
      dishName: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error('Unauthorized');
      const buffer = Buffer.from(input.image, 'base64');
      const imagePath = join(tmpdir(), `ingredient-${Date.now()}.jpg`);
      await writeFile(imagePath, buffer);
      const imageUrl = imagePath; // Use Supabase Storage in production
      await inngest.send({
        name: 'ingredient/detect',
        data: {
          imageUrl,
          userId: ctx.userId,
          dishName: input.dishName
        },
      });
      return { message: 'Image uploaded, processing started' };
    }),
});