import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export interface JWTPayload {
    userId: string;
    email: string;
    exp: number;
    iat: number;
}

export async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
    try {
        const { userId } = await auth();
        if (!userId) return null;

        // Get user details from Clerk
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const email = user.emailAddresses[0]?.emailAddress || '';

        return {
            userId,
            email,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 1 day from now
            iat: Math.floor(Date.now() / 1000),
        };
    } catch (error) {
        console.error('Error getting user from request:', error);
        return null;
    }
}

export async function checkUserExists(email: string): Promise<boolean> {
    try {
        const client = await clerkClient();
        const response = await client.users.getUserList({
            emailAddress: [email],
        });

        return response.data.length > 0;
    } catch (error) {
        console.error('Error checking user existence:', error);
        return false;
    }
} 