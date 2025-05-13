import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // IMPORTANT: Only initialize Supabase client for session checking
  // but don't perform any redirections at the middleware level
  const supabase = createMiddlewareClient({ req, res });
  
  // Get session data but don't use it for redirections
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('Middleware - Path:', req.nextUrl.pathname);
  console.log('Middleware - Session exists:', !!session);

  // DO NOT REDIRECT IN MIDDLEWARE - Let client-side handle all redirections
  // This avoids redirection loops and conflicts

  return res;
}

// Limit middleware to essential paths only
export const config = {
  matcher: ['/', '/login', '/register', '/user/:path*'],
}; 