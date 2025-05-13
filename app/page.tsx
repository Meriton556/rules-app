"use client";

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import FeaturedCategories from "@/components/featured-categories"
import FeaturedRules from "@/components/featured-rules"
import Logo from "@/components/logo"
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  // Simple redirection for unauthenticated users
  useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true);
      console.log("Home page - User not authenticated, redirecting to login");
      window.location.replace("/login");
    }
  }, [loading, user, redirecting]);

  // Show loading state while checking authentication
  if (loading || redirecting || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-900/40">
        <div className="text-white">
          {loading ? "Loading..." : "Redirecting to login..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Logo className="mx-auto mb-6 w-24 h-24" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Rules</h1>
          <p className="text-lg text-zinc-400 mb-8">
            The ultimate resource for developers to find, share, and collaborate on best practices, coding standards,
            and development guidelines.
          </p>

          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-500" />
            </div>
            <Input
              type="text"
              placeholder="Search for rules, best practices, or coding standards..."
              className="pl-10 py-6 bg-zinc-800/50 border-zinc-700 text-white w-full focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        <FeaturedCategories />

        <FeaturedRules />
      </main>
    </div>
  )
}
