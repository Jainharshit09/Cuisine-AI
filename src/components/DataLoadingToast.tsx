'use client';

import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface DataLoadingToastProps {
    userId?: string;
    onComplete?: () => void;
}

// Global flag to prevent duplicate toast sequences
let isToastSequenceRunning = false;

export function showDataLoadingToast(userId?: string, onComplete?: () => void) {
    // Prevent duplicate sequences
    if (isToastSequenceRunning) {
        console.log('Toast sequence already running, skipping...');
        return;
    }

    isToastSequenceRunning = true;

    const steps = [
        { message: 'Successfully logged in!', description: 'Welcome back to Cuisine AI', type: 'success' as const },
        { message: 'Collecting your data...', description: 'Setting up your personalized experience', type: 'info' as const },
        { message: 'Loading your preferences...', description: 'Retrieving dietary preferences and restrictions', type: 'info' as const },
        { message: 'Collecting recipe data...', description: 'Gathering your saved recipes and favorites', type: 'info' as const },
        { message: 'Setting up meal planner...', description: 'Preparing your meal planning tools', type: 'info' as const },
        { message: 'Ready to cook!', description: 'Your personalized culinary assistant is ready', type: 'success' as const },
    ];

    let currentStep = 0;

    const showStep = () => {
        if (currentStep >= steps.length) {
            isToastSequenceRunning = false;
            onComplete?.();
            return;
        }

        const step = steps[currentStep];

        if (step.type === 'success') {
            toast.success(step.message, {
                description: step.description,
                duration: 2000,
            });
        } else {
            toast.info(step.message, {
                description: step.description,
                duration: 2000,
            });
        }

        currentStep++;

        // Show next step after delay
        setTimeout(showStep, 1500);
    };

    // Start the sequence
    showStep();
}

export default function DataLoadingToast({ userId, onComplete }: DataLoadingToastProps) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userId && !isLoading) {
            setIsLoading(true);
            showDataLoadingToast(userId, () => {
                setIsLoading(false);
                onComplete?.();
            });
        }
    }, [userId, isLoading, onComplete]);

    return null; // This component doesn't render anything visible
} 