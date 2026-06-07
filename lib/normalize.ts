/**
 * Normalizes a mk-auth server address for consistent storage and lookup.
 * Removes protocol, trailing slash, and lowercases.
 *
 * Examples:
 *   'HTTP://192.168.1.10/'   -> '192.168.1.10'
 *   'empresa.mkauth.com/'    -> 'empresa.mkauth.com'
 *   '192.168.1.10'           -> '192.168.1.10'
 */
export function normalizeMkAuthAddress(address: string): string {
  return address
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}
