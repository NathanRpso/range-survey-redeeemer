/**
 * Short code generator – produces codes like RG-4H2M
 *
 * Charset excludes visually ambiguous characters: 0 O 1 I L
 * Format: RG-XXXX  (prefix + 4 chars)
 * ~850k combinations – plenty for this use case.
 */
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomChar(): string {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)]
}

export function generateShortCode(): string {
  const body = Array.from({ length: 4 }, randomChar).join('')
  return `RG-${body}`
}
