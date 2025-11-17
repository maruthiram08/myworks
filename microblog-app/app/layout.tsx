import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import QueryProvider from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "@/components/layout/sidebar";
import { TrendingSidebar } from "@/components/layout/trending-sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Microblog - Share your thoughts",
  description: "A modern microblogging platform built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthSessionProvider>
            <QueryProvider>
              <div className="flex min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
                <Sidebar />
                <main className="flex-1 border-r border-gray-200 dark:border-gray-800 max-w-2xl">
                  {children}
                </main>
                <TrendingSidebar />
              </div>
              <Toaster position="bottom-center" />
            </QueryProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
