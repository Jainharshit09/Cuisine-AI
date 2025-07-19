'use client';

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { LoadingSpinner } from "@/components/ui/loading";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black-to-br from-orange-50 via-white to-green-50 px-4">
            <div className="w-full max-w-md">
                <SignUp
                    appearance={{
                        baseTheme: dark,
                        elements: {
                            formButtonPrimary: "bg-black hover:bg-gray-800",
                            card: "bg-white shadow-xl",
                        }
                    }}
                    afterSignUpUrl="/dashboard"
                    redirectUrl="/dashboard"
                />
            </div>
        </div>
    );
}