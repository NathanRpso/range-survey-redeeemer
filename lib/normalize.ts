/**
 * Normalise an email address into a stable dedupe key.
 * Lowercase + trimmed. The normalised value is stored and used for the
 * unique constraint; the raw value is also stored for staff reference.
 */
export function normalizeContact(contact: string): string {
  return contact.trim().toLowerCase()
}
