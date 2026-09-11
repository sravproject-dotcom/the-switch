import { createClient } from '@supabase/supabase-js'

// The frontend uses the anon key (safe to expose, RLS-gated). The Worker
// uses the service-role key instead, kept server-side only, so the agent
// can read/write freely without fighting RLS policies. Set SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY as Worker secrets (see .dev.vars.example) — do
// NOT reuse the VITE_ prefixed ones, those are inlined into the client
// bundle at build time and aren't available to the Worker at runtime.
export function getSupabaseAdmin(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Supabase is not configured for the Worker. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as Worker secrets.'
    )
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}
