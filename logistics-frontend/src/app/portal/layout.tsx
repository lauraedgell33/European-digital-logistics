'use client';

import Link from 'next/link';
import { TruckIcon } from '@heroicons/react/24/outline';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--ds-background-100)] flex flex-col">
      {/* Top bar */}
      <header className="border-b border-[var(--ds-gray-200)] bg-[var(--ds-background-100)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-2 text-[var(--ds-gray-1000)] hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-[var(--ds-blue-700)] flex items-center justify-center">
              <TruckIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">LogiMarket</span>
            <span className="text-[var(--ds-gray-600)] text-sm font-normal hidden sm:inline ml-1">Customer Portal</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-[var(--ds-gray-700)] hover:text-[var(--ds-gray-1000)] transition-colors"
            >
              Main Site
            </Link>
            <Link
              href="/login"
              className="text-sm text-[var(--ds-blue-700)] hover:text-[var(--ds-blue-800)] font-medium transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--ds-gray-200)] bg-[var(--ds-background-100)] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--ds-gray-600)]">
            <p>&copy; {new Date().getFullYear()} LogiMarket. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-[var(--ds-gray-1000)] transition-colors">Home</Link>
              <Link href="/login" className="hover:text-[var(--ds-gray-1000)] transition-colors">Login</Link>
              <Link href="/register" className="hover:text-[var(--ds-gray-1000)] transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
