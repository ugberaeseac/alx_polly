import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          req.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          req.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // if user is signed in and the current path is /auth/login or /auth/register, redirect to /polls
  if (user && (req.nextUrl.pathname === '/auth/login' || req.nextUrl.pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/polls', req.url));
  }

  // if user is not signed in and the current path is not /auth/login, /auth/register, or /, redirect to /auth/login
  if (!user && req.nextUrl.pathname !== '/auth/login' && req.nextUrl.pathname !== '/auth/register' && req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/', '/auth/:path*', '/polls/:path*', '/create-poll/:path*'],
};