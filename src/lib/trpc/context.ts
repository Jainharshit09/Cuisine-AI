import { auth } from '@clerk/nextjs/server'; // Make sure this is the import
import prisma from '../prisma';

export type Context = {
  prisma: typeof prisma;
  userId: string | null;
};

export const createContext = async (): Promise<Context> => {
  const { userId } = await auth(); // ✅ await here!
  return { prisma, userId };
};
