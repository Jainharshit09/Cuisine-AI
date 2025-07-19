'use client';

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { toast } from "sonner";
import { useEffect } from "react";
import { showDataLoadingToast } from "./DataLoadingToast";

interface CustomSignInProps {
    afterSignInUrl?: string;
    afterSignUpUrl?: string;
    signUpUrl?: string;
}

export default function CustomSignIn({
    afterSignInUrl = "/dashboard",
    afterSignUpUrl = "/dashboard",
    signUpUrl = "/auth/sign-up"
}: CustomSignInProps) {

    useEffect(() => {
        // Welcome toast
        toast.info('Welcome to Cuisine AI', {
            description: 'Sign in to access your personalized culinary assistant',
            duration: 3000,
        });

        // Listen for authentication errors
        const handleAuthError = (event: any) => {
            const error = event.detail;
            console.error('Authentication error:', error);

            // Handle specific error codes
            if (error?.code === 'form_identifier_not_found' ||
                error?.message?.includes('not found') ||
                error?.message?.includes('not registered') ||
                error?.message?.includes('does not exist')) {
                toast.error('Account not found', {
                    description: 'This email is not registered. Please sign up first.',
                    duration: 5000,
                    action: {
                        label: 'Sign Up',
                        onClick: () => window.location.href = signUpUrl
                    }
                });
            } else if (error?.code === 'form_password_incorrect') {
                toast.error('Incorrect password', {
                    description: 'Please check your password and try again.',
                    duration: 4000,
                });
            } else if (error?.code === 'oauth_callback_error') {
                toast.error('Google sign-in failed', {
                    description: 'There was an issue with Google authentication. Please try again.',
                    duration: 4000,
                });
            } else if (error?.code === 'form_identifier_exists') {
                toast.error('Account already exists', {
                    description: 'This email is already registered. Please sign in instead.',
                    duration: 4000,
                });
            } else if (error?.code === 'form_password_pwned') {
                toast.error('Password security issue', {
                    description: 'This password has been compromised. Please choose a different password.',
                    duration: 5000,
                });
            } else if (error?.code === 'form_password_validation_failed') {
                toast.error('Password requirements not met', {
                    description: 'Password must be at least 8 characters long.',
                    duration: 4000,
                });
            } else if (error?.code === 'network_error' || error?.message?.includes('network')) {
                toast.error('Network error', {
                    description: 'Please check your internet connection and try again.',
                    duration: 4000,
                });
            } else if (error?.code === 'rate_limit_exceeded') {
                toast.error('Too many attempts', {
                    description: 'Please wait a few minutes before trying again.',
                    duration: 5000,
                });
            } else {
                // Generic error handling
                toast.error('Authentication failed', {
                    description: error?.message || 'Please try again or contact support.',
                    duration: 4000,
                });
            }
        };

        // Listen for successful authentication
        const handleAuthSuccess = (event: any) => {
            // Use the enhanced data loading toast
            showDataLoadingToast();
        };

        // Add event listeners
        window.addEventListener('clerk-error', handleAuthError);
        window.addEventListener('clerk-sign-in', handleAuthSuccess);

        return () => {
            window.removeEventListener('clerk-error', handleAuthError);
            window.removeEventListener('clerk-sign-in', handleAuthSuccess);
        };
    }, [signUpUrl]);

    return (
        <SignIn
            appearance={{
                baseTheme: dark,
                elements: {
                    formButtonPrimary: "bg-orange-500 hover:bg-orange-600 text-white border-0",
                    card: "bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl",
                    socialButtonsBlockButton: "bg-gray-800/50 border border-gray-600 hover:bg-gray-700/50",
                    socialButtonsBlockButtonText: "text-white",
                    formFieldInput: "bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500",
                    formFieldLabel: "text-gray-300",
                    headerTitle: "text-white",
                    headerSubtitle: "text-gray-400",
                    dividerLine: "bg-gray-700",
                    dividerText: "text-gray-400",
                    footerActionLink: "text-orange-400 hover:text-orange-300",
                    formFieldErrorText: "text-red-400",
                    formResendCodeLink: "text-orange-400 hover:text-orange-300",
                }
            }}
            afterSignInUrl={afterSignInUrl}
            afterSignUpUrl={afterSignUpUrl}
            signUpUrl={signUpUrl}
        />
    );
} 