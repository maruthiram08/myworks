"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { BookOpen, User, LogOut, LayoutDashboard, Menu } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>CourseHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/courses"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Courses
            </Link>

            {session?.user.role === "INSTRUCTOR" || session?.user.role === "ADMIN" ? (
              <Link
                href="/instructor/dashboard"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Teach
              </Link>
            ) : null}

            {session?.user.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Admin
              </Link>
            )}

            {status === "loading" ? (
              <div className="text-gray-400">Loading...</div>
            ) : session ? (
              <div className="flex items-center gap-4">
                <Link href="/student/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    My Learning
                  </Button>
                </Link>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link
                href="/courses"
                className="text-gray-700 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>

              {session ? (
                <>
                  <Link
                    href="/student/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Learning
                  </Link>

                  {(session.user.role === "INSTRUCTOR" || session.user.role === "ADMIN") && (
                    <Link
                      href="/instructor/dashboard"
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Teach
                    </Link>
                  )}

                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin/dashboard"
                      className="text-gray-700 hover:text-blue-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
