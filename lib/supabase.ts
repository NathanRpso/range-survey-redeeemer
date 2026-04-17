import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { RedemptionPass } from '@/types'

type Database = {
  public: {
    Tables: {
      redemption_passes: {
        Row: RedemptionPass
        Insert: Omit<RedemptionPass, 'id' | 'created_at'>
        Update: Partial<Omit<RedemptionPass, 'id' | 'created_at'>>
      }
    }
  }
}

/**
 * Server-side Supabase client — service role key.
 *
 * SECURITY MODEL
 * ──────────────
 * - SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix and is therefore
 *   never included in the Next.js browser bundle.
 * - This function is only ever called from server actions (actions/claim.ts,
 *   actions/redeem.ts). No client component imports or calls it.
 * - The service role key bypasses RLS, which is intentional: all access
 *   control is enforced at the application layer (input validation, dedupe,
 *   expiry, redeem guards) inside the server actions themselves.
 * - RLS remains ENABLED on the table as a defence-in-depth measure: even if
 *   the anon key were somehow obtained, direct table access is blocked.
 *
 * DO NOT:
 *   - rename this env var with a NEXT_PUBLIC_ prefix
 *   - import this file from any file under app/ that is a client component
 *   - pass the Supabase client instance as a prop or through context
 */
export function createServerClient(): SupabaseClient<Database> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.',
    )
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  })
}
