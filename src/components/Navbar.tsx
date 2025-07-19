'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/recipes', label: 'Recipes' },
    { href: '/dashboard/meal-planner', label: 'Meal Planner' },
    { href: '/dashboard/shopping-list', label: 'Shopping List' },
    { href: '/dashboard/nutrition', label: 'Nutrition' },
  ];

  const isActive = (href: string) => pathname === href;

  const handleNavClick = (label: string) => {
    toast.info(`Navigating to ${label}...`, {
      description: 'Loading your personalized content',
      duration: 2000,
    });
  };

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2" prefetch={true}>
              <img src="/logo.png" alt="Cuisine AI" className="h-8 w-8" />
              <span className="text-xl font-bold text-orange-500">Cuisine AI</span>
            </Link>
            <div className="animate-pulse bg-gray-700 h-8 w-8 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isSignedIn ? "/dashboard" : "/"} className="flex items-center space-x-2" prefetch={true}>
            <img src="/logo.png" alt="Cuisine AI" className="h-8 w-8" />
            <span className="text-xl font-bold text-orange-500">Cuisine AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isSignedIn && (
              // Show all navigation items when user is signed in
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => handleNavClick(item.label)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(item.href)
                    ? 'text-orange-500 bg-orange-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                  {item.label}
                </Link>
              ))
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  }
                }}
              />
            ) : (
              // Show auth buttons when not signed in
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/auth/sign-in">
                  <button
                    onClick={() => toast.info('Redirecting to Sign In...', { duration: 2000 })}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Sign In
                  </button>
                </Link>
                <Link href="/auth/sign-up">
                  <button
                    onClick={() => toast.info('Redirecting to Sign Up...', { duration: 2000 })}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50"
            >
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Fixed positioning */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {isSignedIn ? (
                // Show all navigation items when user is signed in
                navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleNavClick(item.label);
                    }}
                    className={`block px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 ${isActive(item.href)
                      ? 'text-orange-500 bg-orange-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }`}
                  >
                    {item.label}
                  </Link>
                ))
              ) : (
                // Show auth items when user is not signed in
                <>
                  <Link
                    href="/auth/sign-in"
                    onClick={() => {
                      setIsMenuOpen(false);
                      toast.info('Redirecting to Sign In...', { duration: 2000 });
                    }}
                    className="block px-3 py-3 rounded-md text-base font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    onClick={() => {
                      setIsMenuOpen(false);
                      toast.info('Redirecting to Sign Up...', { duration: 2000 });
                    }}
                    className="block px-3 py-3 rounded-md text-base font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
