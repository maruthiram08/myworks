import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Sidebar from "@/components/layout/sidebar"
import TrendingSidebar from "@/components/layout/trending-sidebar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-20 lg:ml-64 border-r border-border min-h-screen">
        {children}
      </main>
      <TrendingSidebar />
    </div>
  )
}
