import type { Metadata } from 'next';
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "XponentL Coding Rules - Development Best Practices and Coding Standards",
  description: "Discover, share, and collaborate on development best practices, coding standards, and guidelines.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={cn(
        inter.className,
        "min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-900/40"
      )}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <div className="min-h-screen">
              <main className="h-screen">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}