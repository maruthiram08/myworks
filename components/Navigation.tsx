"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Plus, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
            <span className="font-bold text-xl hidden sm:block">
              ProductHunt
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Home
            </Link>
            <Link
              href="/leaderboard"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Leaderboard
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Categories
            </Link>

            {session ? (
              <>
                {(session.user.role === "MAKER" ||
                  session.user.role === "ADMIN") && (
                  <Link
                    href="/submit"
                    className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit</span>
                  </Link>
                )}

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link
              href="/"
              className="block text-gray-700 hover:text-gray-900 font-medium"
            >
              Home
            </Link>
            <Link
              href="/leaderboard"
              className="block text-gray-700 hover:text-gray-900 font-medium"
            >
              Leaderboard
            </Link>
            <Link
              href="/categories"
              className="block text-gray-700 hover:text-gray-900 font-medium"
            >
              Categories
            </Link>

            {session ? (
              <>
                {(session.user.role === "MAKER" ||
                  session.user.role === "ADMIN") && (
                  <Link
                    href="/submit"
                    className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                  >
                    Submit Product
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="block text-gray-700 hover:text-gray-900 font-medium"
                >
                  Profile
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="block text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="block text-red-600 hover:text-red-700 font-medium w-full text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block text-gray-700 hover:text-gray-900 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
