/**
 * Password hashing with PBKDF2-SHA256 over WebCrypto — available in workerd,
 * Node and the browser alike, with no native dependency to bundle.
 */

/**
 * PBKDF2 rounds.
 *
 * 100,000 is not a preference — it is workerd's ceiling. Above it the runtime
 * throws `NotSupportedError: iteration counts above 100000 are not supported`,
 * which is what a higher number did here: the hash threw, the sign-up action
 * died with it, and the browser showed an unexplained "page couldn't load".
 *
 * Below OWASP's current figure for PBKDF2-SHA256, and there is no way around
 * that while the KDF is PBKDF2 on Workers. Each hash stores the count it was
 * made with, so raising this later re-hashes nobody and breaks no logins.
 */
const ITERATIONS = 100_000;
const KEY_BITS = 256;

const enc = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const s = value.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s.padEnd(Math.ceil(s.length / 4) * 4, "="));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    KEY_BITS,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return {
    hash: toBase64Url(hash),
    salt: toBase64Url(salt),
    iterations: ITERATIONS,
  };
}

export async function verifyPassword(
  password: string,
  stored: { hash: string; salt: string; iterations: number },
): Promise<boolean> {
  const expected = fromBase64Url(stored.hash);
  const actual = await derive(password, fromBase64Url(stored.salt), stored.iterations);
  if (expected.length !== actual.length) return false;
  // Constant-time compare — a length-equal mismatch must not leak where.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ actual[i];
  return diff === 0;
}

/** A session cookie value: 32 random bytes, only ever stored as its hash. */
export function newToken(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(token));
  return toBase64Url(new Uint8Array(digest));
}

export const newId = () => crypto.randomUUID();

/**
 * Rules kept deliberately mild: this guards a shop dashboard, and rules that
 * are annoying push people towards writing the password on the counter.
 */
export function passwordProblem(password: string): string | null {
  if (password.length < 10) return "Use at least 10 characters.";
  if (!/[a-zA-Z]/.test(password)) return "Include at least one letter.";
  if (!/[0-9]/.test(password)) return "Include at least one number.";
  return null;
}
