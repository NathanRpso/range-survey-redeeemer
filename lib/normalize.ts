/**
 * Normalise a contact string (email or mobile) into a stable dedupe key.
 *
 * Email  → lowercase + trimmed
 * Phone  → digits only, last 8 digits (handles +65XXXXXXXX / 65XXXXXXXX / XXXXXXXX)
 *
 * The normalised value is stored and used for the unique constraint; the raw
 * value is also stored for staff reference.
 */
export function normalizeContact(contact: string): string {
  const trimmed = contact.trim().toLowerCase()

  if (trimmed.includes('@')) {
    return trimmed
  }

  const digits = trimmed.replace(/\D/g, '')
  // Take the last 8 digits to strip country/area prefixes
  return `phone:${digits.slice(-8)}`
}
