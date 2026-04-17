'use server'

import { createServerClient } from '@/lib/supabase'
import { ClaimSchema } from '@/lib/validation'
import { getValidClaimCodes, EXPIRY_DAYS } from '@/lib/config'
import { normalizeContact } from '@/lib/normalize'
import { generateShortCode } from '@/lib/codes'

export type ClaimResult =
  | { success: true; shortCode: string }
  | { alreadyClaimed: true; shortCode: string }
  | { error: string }

export async function createRedemptionPass(
  formData: FormData,
): Promise<ClaimResult> {
  // ── 1. Parse + validate input ─────────────────────────────────────────────
  const raw = {
    full_name: formData.get('full_name'),
    contact: formData.get('contact'),
    range_name: formData.get('range_name'),
    claim_code: formData.get('claim_code'),
    survey_location: formData.get('survey_location') || undefined,
  }

  const parsed = ClaimSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { full_name, contact, range_name, claim_code, survey_location } =
    parsed.data

  // ── 2. Validate claim code against config ─────────────────────────────────
  const validCodes = getValidClaimCodes()
  if (!validCodes.includes(claim_code)) {
    return {
      error:
        'That claim code is not valid. Please check the code shown on your survey completion screen.',
    }
  }

  const contactNormalized = normalizeContact(contact)
  const supabase = createServerClient()

  // ── 3. Deduplicate: return existing pass if contact already claimed ────────
  const { data: existing } = await supabase
    .from('redemption_passes')
    .select('short_code')
    .eq('contact_normalized', contactNormalized)
    .maybeSingle()

  if (existing) {
    return { alreadyClaimed: true, shortCode: existing.short_code }
  }

  // ── 4. Generate a unique short code (retry up to 10× on collision) ─────────
  let shortCode = ''
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateShortCode()
    const { data: collision } = await supabase
      .from('redemption_passes')
      .select('id')
      .eq('short_code', candidate)
      .maybeSingle()

    if (!collision) {
      shortCode = candidate
      break
    }
  }

  if (!shortCode) {
    return { error: 'Could not generate a unique code. Please try again.' }
  }

  // ── 5. Insert record ───────────────────────────────────────────────────────
  const expiresAt = new Date(
    Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString()

  const { error: insertError } = await supabase
    .from('redemption_passes')
    .insert({
      full_name,
      contact_raw: contact,
      contact_normalized: contactNormalized,
      range_name,
      survey_location_context: survey_location ?? null,
      claim_code_used: claim_code,
      short_code: shortCode,
      status: 'valid',
      redeemed: false,
      redeemed_at: null,
      expires_at: expiresAt,
    })

  if (insertError) {
    // Race condition: another request inserted with the same contact first
    if (insertError.code === '23505') {
      const { data: raceWinner } = await supabase
        .from('redemption_passes')
        .select('short_code')
        .eq('contact_normalized', contactNormalized)
        .maybeSingle()

      if (raceWinner) {
        return { alreadyClaimed: true, shortCode: raceWinner.short_code }
      }
    }

    console.error('Supabase insert error:', insertError)
    return { error: 'Something went wrong. Please try again in a moment.' }
  }

  return { success: true, shortCode }
}
