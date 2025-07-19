'use client';

import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading';
import { useState, useMemo } from 'react';

// Create a single QueryClient instance outside the component
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    // Memoize the TRPC client to prevent recreation on every render
    const trpcClient = useMemo(() => trpc.createClient({
        links: [
            httpBatchLink({
                url: '/api/trpc',
                // Add timeout and retry configuration
                fetch: (url, options) => {
                    return fetch(url, {
                        ...options,
                        signal: AbortSignal.timeout(10000), // 10 second timeout
                    });
                },
            }),
        ],
    }), []);

    return (
        <ClerkProvider>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                    <main className="container mx-auto p-4 bg-black min-h-screen">
                        <SignedIn>
                            {isLoading ? <LoadingSpinner /> : children}
                        </SignedIn>
                        <SignedOut>
                            <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-black">
                                <h1 className="text-3xl font-bold text-center text-white">Please sign in to access the Culinary Assistant</h1>
                                <div className="flex gap-4">
                                    <Link href="/auth/sign-in" prefetch={true}>
                                        <Button size="lg">Sign In</Button>
                                    </Link>
                                    <Link href="/auth/sign-up" prefetch={true}>
                                        <Button size="lg" variant="outline">Create Account</Button>
                                    </Link>
                                </div>
                            </div>
                        </SignedOut>
                    </main>
                </QueryClientProvider>
            </trpc.Provider>
        </ClerkProvider>
    );
} 