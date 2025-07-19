'use client';

import { LoadingSpinner } from "@/components/ui/loading";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import CustomSignIn from "@/components/CustomSignIn";

export default function SignInPage() {
    const [mounted, setMounted] = useState(false);
    const { isSignedIn } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

            <div className="relative z-10 px-4">
                <div className="mb-8 text-center">
                    <Link href="/">
                        <span className="text-3xl font-extrabold text-orange-500 tracking-tight cursor-pointer hover:text-orange-400 transition-colors">
                            Cuisine AI
                        </span>
                    </Link>
                    <p className="text-gray-400 mt-2">Sign in to access your culinary assistant</p>
                </div>
                <div className="w-full max-w-md">
                    <CustomSignIn />
                </div>
            </div>
        </div>
    );
} 