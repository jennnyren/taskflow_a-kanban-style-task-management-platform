import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

// Untyped client — types are enforced at the hook level.
// For generated types, run: npx supabase gen types typescript --project-id <id>
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
