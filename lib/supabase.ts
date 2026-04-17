import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client — service role key.
 *
 * SECURITY MODEL
 * ──────────────
 * - SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix → never in the browser bundle.
 * - Called only from server actions (actions/claim.ts, actions/redeem.ts).
 * - Service role key bypasses RLS; all access control is enforced in server actions.
 * - RLS is ENABLED on the table — direct anon access is blocked as defence-in-depth.
 *
 * TYPING
 * ──────
 * The client is untyped at construction. Query results are typed explicitly at
 * each call site using `as` casts against the RedemptionPass type, which avoids
 * fighting Supabase's complex Database generic inference.
 */
export function createServerClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.',
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
