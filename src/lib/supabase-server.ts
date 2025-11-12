import "server-only"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!serviceRoleKey && !anonKey) {
  throw new Error("Missing SUPABASE keys. Provide SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

const client = createClient(supabaseUrl, serviceRoleKey ?? anonKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export function getServerSupabaseClient() {
  return client
}
