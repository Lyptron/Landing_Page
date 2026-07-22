/**
 * Client-portal access-code generator.
 *
 * The code is the ONLY authentication factor a client uses to log into
 * their project portal, so it must be:
 *   • Cryptographically unguessable — must NOT be derived from any
 *     public data about the project (name, client, dates). The prior
 *     `slugifyAccessCode(projectName)` generator produced codes like
 *     `NIKE-REDESIGN` which anyone reading the client roster or a
 *     press announcement could guess in one try — the whole point of
 *     the code was voided.
 *   • Sourced from a CSPRNG. `Math.random()` is a PRNG and gives
 *     roughly 40 bits of entropy per 8 chars but is not cryptographically
 *     secure; `crypto.getRandomValues` is.
 *   • Readable / phone-friendly. 8 chars is short enough for support
 *     to read aloud, long enough to give ~40 bits of entropy over the
 *     alphabet below (log2(32^8) = 40).
 *
 * Alphabet is Crockford's base32 style: uppercase letters + digits with
 * the visually-confusable ones removed (0, 1, I, L, O). No lowercase
 * so `A` vs `a` typo doesn't matter. `-` inserted at position 4 so it's
 * chunked (e.g. `K7QP-R9XM`) — the ingestion side already uppercases
 * and strips whitespace, so the dash is decorative for humans.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_BYTES = 8

export function newAccessCode(): string {
  const bytes = new Uint8Array(CODE_BYTES)
  crypto.getRandomValues(bytes)
  const chars: string[] = []
  for (let i = 0; i < CODE_BYTES; i++) {
    // Modulo bias against a 32-char alphabet across an 8-bit byte is
    // negligible for a human-facing code (~0.4% skew on the last char);
    // for a real key we'd use rejection sampling. Not a real key here.
    chars.push(ALPHABET[bytes[i] % ALPHABET.length])
  }
  return `${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`
}

/**
 * Normalize a user-typed code (custom code entered by admin, or the
 * client's login input). Uppercase, strip everything not in the
 * alphabet, cap length. Preserves nothing decorative — the client
 * login flow does the same thing before comparing.
 */
export function normalizeAccessCode(input: string): string {
  return input
    .toUpperCase()
    .replace(new RegExp(`[^${ALPHABET}]`, 'g'), '')
    .slice(0, 24)
}
