import { NextRequest, NextResponse } from 'next/server';
import { createContext } from '@/lib/trpc/context';
import { appRouter } from '@/lib/trpc/routers';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const image = formData.get('image') as File;

  if (!image) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const base64Image = buffer.toString('base64');
  const ctx = await createContext( );
  const caller = appRouter.createCaller(ctx);

  const result = await caller.ingredient.uploadImage({ image: base64Image });

  return NextResponse.json(result);
}