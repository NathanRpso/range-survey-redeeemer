'use server'

import { createServerClient } from '@/lib/supabase'
import { computePassStatus } from '@/types'
import type { RedemptionPass, PassStatus } from '@/types'

export type PassWithStatus = RedemptionPass & { computedStatus: PassStatus }

export type LookupResult =
  | { pass: PassWithStatus }
  | { error: string; code: 'not_found' }

export type RedeemResult =
  | { success: true }
  | { error: string; code: 'not_found' | 'already_redeemed' | 'expired' | 'server_error' }

export async function lookupPass(shortCode: string): Promise<LookupResult> {
  const supabase = createServerClient()

  const { data: pass, error } = (await supabase
    .from('redemption_passes')
    .select('*')
    .eq('short_code', shortCode.trim().toUpperCase())
    .maybeSingle()) as { data: RedemptionPass | null; error: unknown }

  if (error) {
    console.error('Supabase lookup error:', error)
  }

  if (!pass) {
    return {
      error: 'Pass not found. Please check the code and try again.',
      code: 'not_found',
    }
  }

  return { pass: { ...pass, computedStatus: computePassStatus(pass) } }
}

export async function markAsRedeemed(shortCode: string): Promise<RedeemResult> {
  const supabase = createServerClient()

  const { data: pass, error: fetchError } = (await supabase
    .from('redemption_passes')
    .select('*')
    .eq('short_code', shortCode.trim().toUpperCase())
    .maybeSingle()) as { data: RedemptionPass | null; error: unknown }

  if (fetchError) {
    console.error('Supabase fetch error:', fetchError)
  }

  if (!pass) {
    return { error: 'Pass not found.', code: 'not_found' }
  }

  if (pass.redeemed) {
    return { error: 'This pass has already been redeemed.', code: 'already_redeemed' }
  }

  if (new Date(pass.expires_at) < new Date()) {
    return { error: 'This pass has expired and cannot be redeemed.', code: 'expired' }
  }

  const { error: updateError } = await supabase
    .from('redemption_passes')
    .update({
      redeemed: true,
      redeemed_at: new Date().toISOString(),
      status: 'redeemed',
    })
    .eq('short_code', shortCode.trim().toUpperCase())

  if (updateError) {
    console.error('Supabase update error:', updateError)
    return {
      error: 'Failed to mark pass as redeemed. Please try again.',
      code: 'server_error',
    }
  }

  return { success: true }
}
