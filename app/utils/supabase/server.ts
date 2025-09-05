import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `cookies().set()` method can only be called from a Server Component or Route Handler.
            // This error 'No cookies instance found' occurs when trying to set cookies from a Client Component.
            // If you're using this function in a Client Component, it's fine to ignore this error.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `cookies().set()` method can only be called from a Server Component or Route Handler.
            // This error 'No cookies instance found' occurs when trying to remove cookies from a Client Component.
            // If you're using this function in a Client Component, it's fine to ignore this error.
          }
        },
      },
    }
  )
}