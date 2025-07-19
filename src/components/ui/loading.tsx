'use client';

import { FiLoader } from 'react-icons/fi';

export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-green-500 rounded-full animate-spin animation-delay-500"></div>
                </div>
                <div className="text-gray-400 text-sm">Loading...</div>
            </div>
        </div>
    );
}

export function PageLoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
                <FiLoader className="w-8 h-8 text-orange-500 animate-spin" />
                <span className="text-gray-400 text-sm">Loading page...</span>
            </div>
        </div>
    );
}

export function InlineLoadingSpinner() {
    return (
        <div className="flex items-center justify-center p-4">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
    );
} 