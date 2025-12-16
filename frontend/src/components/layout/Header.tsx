'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { FaBell, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { isConnected } = useAccount();
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold text-xl px-3 py-1 rounded">
              DFM
            </div>
            <span className="font-bold text-lg hidden sm:inline">
              Freelance Marketplace
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/jobs" className="text-gray-700 hover:text-primary-600 font-medium">
              Find Work
            </Link>
            <Link href="/post-job" className="text-gray-700 hover:text-primary-600 font-medium">
              Post Job
            </Link>
            <Link href="/my-jobs" className="text-gray-700 hover:text-primary-600 font-medium">
              My Jobs
            </Link>
            {mounted && isConnected && (
              <>
                <Link href="/messages" className="text-gray-700 hover:text-primary-600 relative">
                  <FaEnvelope className="text-xl" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    0
                  </span>
                </Link>
                <Link href="/notifications" className="text-gray-700 hover:text-primary-600 relative">
                  <FaBell className="text-xl" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    0
                  </span>
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!mounted || authLoading ? (
              // Show placeholder during hydration to prevent mismatch
              <>
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                <ConnectButton />
              </>
            ) : isAuthenticated ? (
              <>
                {user && (
                  <div className="hidden sm:block text-sm text-gray-700">
                    {user.displayName || user.username || user.email}
                  </div>
                )}
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Logout
                </button>
                <ConnectButton />
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  Sign Up
                </Link>
                <ConnectButton />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

