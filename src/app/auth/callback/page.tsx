'use client';
import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { LoadingSpinner } from '@/components/ui/loading';

export default function AuthCallback() {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    handleRedirectCallback({
      redirectUrl: '/dashboard',
      afterSignInUrl: '/dashboard',
      afterSignUpUrl: '/dashboard',
    });
  }, [handleRedirectCallback]);

  return <LoadingSpinner />;
}