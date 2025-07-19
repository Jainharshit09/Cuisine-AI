'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc/client';
import { httpBatchLink } from '@trpc/client';
import { Toaster } from '@/components/ui/sonner';
import { useRef } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
    const queryClientRef = useRef(new QueryClient());
    const trpcClientRef = useRef(trpc.createClient({
        links: [
            httpBatchLink({
                url: '/api/trpc',
            }),
        ],
    }));

    return (
        <ClerkProvider>
            <trpc.Provider client={trpcClientRef.current} queryClient={queryClientRef.current}>
                <QueryClientProvider client={queryClientRef.current}>
                    {children}
                    <Toaster
                        position="top-right"
                        richColors
                        closeButton
                        duration={4000}
                    />
                </QueryClientProvider>
            </trpc.Provider>
        </ClerkProvider>
    );
} 