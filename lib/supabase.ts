import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Placeholder values for build time - will be replaced at runtime
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key'

export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
}

export function isSupabaseConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
}
