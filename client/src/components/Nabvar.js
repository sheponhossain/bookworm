'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-[#E5DCC3] sticky top-0 z-[100] px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <h2 className="text-2xl font-serif font-bold tracking-tighter text-[#4A3728]">
            Lumina<span className="text-[#C1A88D]">Books</span>
          </h2>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-bold text-sm text-[#4A3728]/70">
          {user?.role === 'admin' && (
            <Link
              href="/dashboard"
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              Admin Panel
            </Link>
          )}
          <Link
            href="/browse"
            className="hover:text-[#4A3728] transition-colors"
          >
            Browse
          </Link>
          {/* Sudhu User hole 'My Library' dekhbe */}
          {user?.role === 'user' && (
            <Link
              href="/my-library"
              className="hover:text-[#4A3728] transition-colors"
            >
              My Library
            </Link>
          )}
          <Link
            href="/tutorials"
            className="hover:text-[#4A3728] transition-colors"
          >
            Tutorials
          </Link>
        </div>

        {/* Auth Buttons / User Profile */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${user.name}`
                }
                className="w-10 h-10 rounded-xl border border-[#E5DCC3]"
                alt="Profile"
              />
              <button
                onClick={logout}
                className="hidden md:block text-xs font-black uppercase tracking-widest text-red-500 hover:opacity-70"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm font-bold text-[#4A3728]"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-[#4A3728] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-all"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-2xl"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-[#E5DCC3] p-6 space-y-4 flex flex-col font-bold shadow-xl">
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              Admin Panel
            </Link>
          )}
          <Link href="/browse" onClick={() => setIsMenuOpen(false)}>
            Browse
          </Link>
          {/* Sudhu User hole 'My Library' dekhbe */}
          {user?.role === 'user' && (
            <Link
              href="/my-library"
              className="hover:text-[#4A3728] transition-colors"
            >
              My Library
            </Link>
          )}
          <Link href="/tutorials" onClick={() => setIsMenuOpen(false)}>
            Tutorials
          </Link>
          {user && (
            <button onClick={logout} className="text-left text-red-500">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
