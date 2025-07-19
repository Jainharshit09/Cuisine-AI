import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Webhook received:', JSON.stringify(body, null, 2));

        // Only handle user.created events
        if (body.type !== 'user.created') {
            return NextResponse.json({ ok: true, ignored: true });
        }

        const { id, email_addresses } = body.data;
        const email = email_addresses[0]?.email_address || '';

        // Check if user already exists by clerkId or email
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { clerkId: id },
                    { email }
                ]
            }
        });
        if (existing) return NextResponse.json({ ok: true });

        await prisma.user.create({
            data: {
                clerkId: id,
                email,
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
} 