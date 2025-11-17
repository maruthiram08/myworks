"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Shield,
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Explore", href: "/explore" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
    {
      icon: User,
      label: "Profile",
      href: `/profile/${session?.user?.id}`,
    },
  ]

  if (session?.user?.id) {
    const adminItem = { icon: Shield, label: "Admin", href: "/admin" }
    // Add admin link conditionally (you can check user.isAdmin from API)
  }

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-20 flex-col items-center border-r border-border bg-background py-8 lg:w-64 lg:items-start lg:px-6">
      <div className="mb-8">
        <Link href="/" className="flex items-center justify-center lg:justify-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground lg:mr-3">
            <span className="text-xl font-bold">T</span>
          </div>
          <span className="hidden text-xl font-bold lg:block">Twitter</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 w-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center lg:justify-start rounded-full px-4 py-3 transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-accent"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="ml-4 hidden text-lg lg:block">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto w-full space-y-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center justify-center lg:justify-start rounded-full px-4 py-3 hover:bg-accent"
        >
          {theme === "dark" ? (
            <Sun className="h-6 w-6" />
          ) : (
            <Moon className="h-6 w-6" />
          )}
          <span className="ml-4 hidden text-lg lg:block">Theme</span>
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center lg:justify-start rounded-full px-4 py-3 text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="h-6 w-6" />
          <span className="ml-4 hidden text-lg lg:block">Logout</span>
        </button>

        {session?.user && (
          <div className="hidden lg:flex items-center space-x-3 border-t border-border pt-4">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">
                {session.user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{session.user.username}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
