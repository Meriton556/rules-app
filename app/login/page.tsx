"use client";

import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  // Redirect authenticated users to home
  useEffect(() => {
    if (!loading && user && !redirecting) {
      setRedirecting(true);
      console.log("Login page - User already authenticated, redirecting to home");
      window.location.replace("/");
    }
  }, [loading, user, redirecting]);

  if (loading || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-white">
          {loading ? "Loading..." : "Redirecting..."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-900/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">XponentL Coding Rules</h1>
          <p className="text-blue-400">Sign in to contribute and manage your coding rules</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 