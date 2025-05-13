"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if already logged in
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-900/40">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (user) {
    router.push("/");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-900/40 p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">XponentL Coding Rules</h1>
            <p className="text-zinc-400">Create a new account to get started</p>
          </div>
          <LoginForm initialMode="signup" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">XponentL Coding Rules</h1>
          <p className="text-zinc-400">Create a new account to get started</p>
        </div>
        <LoginForm initialMode="signup" />
      </div>
    </div>
  );
} 