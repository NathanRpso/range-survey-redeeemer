// ─── Ranges ──────────────────────────────────────────────────────────────────
// Edit this list to add / remove ranges. The value is stored verbatim in the DB.
export const RANGES = [
  'Marina Bay Range',
  'Orchard Indoor Golf',
  'Sentosa Range',
] as const

export type RangeName = (typeof RANGES)[number]

// ─── Claim codes ─────────────────────────────────────────────────────────────
// Set CLAIM_CODES env var as a comma-separated list: RANGE26,SPRING26
// To add per-range codes later, replace this with a Map<RangeName, string[]>.
export function getValidClaimCodes(): string[] {
  const raw = process.env.CLAIM_CODES ?? 'RANGE26'
  return raw
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)
}

// ─── Expiry ───────────────────────────────────────────────────────────────────
// Change EXPIRY_DAYS env var to adjust the redemption window (default: 14 days).
export const EXPIRY_DAYS = Number(process.env.EXPIRY_DAYS ?? '14')

// ─── App URL ──────────────────────────────────────────────────────────────────
// Used to build the QR code URL. Set NEXT_PUBLIC_APP_URL in production.
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
