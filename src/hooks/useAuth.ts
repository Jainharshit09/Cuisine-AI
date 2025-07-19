import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { showDataLoadingToast } from '@/components/DataLoadingToast';

export function useAuth() {
    const { isSignedIn, isLoaded, userId } = useClerkAuth();
    const { user } = useUser();

    useEffect(() => {
        // Listen for authentication state changes
        if (isLoaded && isSignedIn && user) {
            // Use the enhanced data loading toast (global flag prevents duplicates)
            showDataLoadingToast(userId);
        }
    }, [isLoaded, isSignedIn, user, userId]);

    return {
        isSignedIn,
        isLoaded,
        userId,
        user,
    };
}

export function useAuthError() {
    const handleAuthError = (error: any) => {
        console.log('Auth error:', error);

        // Check if the error is related to email not being registered
        if (error?.code === 'form_identifier_not_found' ||
            error?.message?.includes('not found') ||
            error?.message?.includes('not registered') ||
            error?.message?.includes('does not exist')) {
            toast.error('Email is not registered. Please sign up first.', {
                description: 'This email address is not associated with any account.',
                duration: 5000,
            });
        } else if (error?.code === 'form_password_incorrect') {
            toast.error('Incorrect password. Please try again.', {
                description: 'The password you entered is incorrect.',
                duration: 3000,
            });
        } else {
            toast.error('Authentication failed. Please try again.', {
                description: error?.message || 'An unexpected error occurred.',
                duration: 3000,
            });
        }
    };

    return { handleAuthError };
} 