"use client";

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';

export default function UserMenu() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" className="border-zinc-700">
          Sign In
        </Button>
      </Link>
    );
  }

  // Get user initials or first character of email
  const userInitials = user.email 
    ? user.email.split('@')[0].charAt(0).toUpperCase()
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-md h-14 flex items-center gap-2 border-0 px-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.user_metadata?.avatar_url || ""} />
            <AvatarFallback className="bg-emerald-600 text-white text-xl font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-white font-semibold hidden sm:inline">
            {user.email?.split('@')[0] || 'User'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
        <DropdownMenuItem className="text-zinc-300">
          <User className="mr-2 h-4 w-4" />
          <span>{user.email}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 