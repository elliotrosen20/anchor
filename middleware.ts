import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  console.log("Middleware checking auth. Session exists:", !!session);
  
  const protectedRoutes = ['/chat'];
  
  const authRoutes = ['/login', '/signup'];
  
  const path = req.nextUrl.pathname;
  
  if (protectedRoutes.some(route => path.startsWith(route)) && !session) {
    console.log("Middleware: Blocking access to protected route, redirecting to login");
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }
  
  if (authRoutes.some(route => path === route) && session) {
    console.log("Middleware: User already authenticated, redirecting to chat");
    const redirectTo = req.nextUrl.searchParams.get('redirectTo') || '/chat';
    const redirectUrl = new URL(redirectTo, req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

export const config = {
  matcher: ['/chat', '/chat/:path*', '/login', '/signup'],
};