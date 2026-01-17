import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Placeholder values for build time - will be replaced at runtime
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key'
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || 'placeholder-service-key'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Service role client for admin operations (bypasses RLS)
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
