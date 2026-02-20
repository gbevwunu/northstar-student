'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/compliance', label: 'Checklist' },
  { href: '/dashboard/work-log', label: 'Work Hours' },
  { href: '/dashboard/documents', label: 'Documents' },
  { href: '/dashboard/tenancy', label: 'Tenancy' },
];

export default function DashboardNav() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="border-b border-slate-700/50 px-6 py-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="/dashboard" className="flex items-center gap-3">
          <span className="text-xl">⭐</span>
          <span className="font-bold">NorthStar</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white transition">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Profile link */}
          <a
            href="/dashboard/profile"
            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold hover:bg-blue-500 transition"
          >
            {user?.firstName?.[0] || '?'}
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-700/50 z-50">
          <nav className="flex flex-col px-6 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-3 px-4 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/dashboard/profile"
              className="py-3 px-4 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              onClick={() => setMobileOpen(false)}
            >
              ⚙️ Profile & Settings
            </a>
            <button
              onClick={handleLogout}
              className="py-3 px-4 text-left text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition"
            >
              Log Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
