export type PassStatus = 'valid' | 'redeemed' | 'expired'

export interface RedemptionPass {
  id: string
  full_name: string
  contact_raw: string
  contact_normalized: string
  range_name: string
  survey_location_context: string | null
  claim_code_used: string
  short_code: string
  status: PassStatus
  redeemed: boolean
  created_at: string
  redeemed_at: string | null
  expires_at: string
}

export function computePassStatus(
  pass: Pick<RedemptionPass, 'redeemed' | 'expires_at'>,
): PassStatus {
  if (pass.redeemed) return 'redeemed'
  if (new Date(pass.expires_at) < new Date()) return 'expired'
  return 'valid'
}
