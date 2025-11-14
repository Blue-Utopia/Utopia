'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { FaBell, FaEnvelope } from 'react-icons/fa';

export function Header() {
  const { isConnected } = useAccount();

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
            {isConnected && (
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

          {/* Connect Wallet Button */}
          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}

