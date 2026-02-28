/**
 * Secure token storage utility.
 *
 * Wraps localStorage with lightweight XOR + Base64 obfuscation so that
 * raw JWT tokens are never stored in plain-text.  This is NOT encryption
 * (the key is static and client-side), but it defeats casual XSS
 * exfiltration via `JSON.parse(localStorage)` or automated scrapers.
 *
 * For true security the token should be moved to an httpOnly cookie
 * (requires backend changes).
 */

const STORAGE_KEY = 'auth_token';
const XOR_KEY = 'L0g1M@rk3t$ecur3K3y!2026';

function xorEncode(input: string, key: string): string {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    result += String.fromCharCode(
      input.charCodeAt(i) ^ key.charCodeAt(i % key.length),
    );
  }
  return result;
}

function toBase64(str: string): string {
  if (typeof window !== 'undefined') {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16)),
      ),
    );
  }
  return Buffer.from(str, 'utf-8').toString('base64');
}

function fromBase64(b64: string): string {
  if (typeof window !== 'undefined') {
    return decodeURIComponent(
      Array.from(atob(b64), (c) =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2),
      ).join(''),
    );
  }
  return Buffer.from(b64, 'base64').toString('utf-8');
}

export const tokenStorage = {
  /** Retrieve the auth token (or null). */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      // Support reading legacy plain-text tokens (migration path)
      if (!stored.startsWith('enc:')) {
        // Migrate in-place to encoded format
        tokenStorage.setToken(stored);
        return stored;
      }

      const encoded = stored.slice(4); // strip "enc:" prefix
      const decoded = fromBase64(encoded);
      return xorEncode(decoded, XOR_KEY);
    } catch {
      // Corrupt value — wipe it
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  /** Persist the token in obfuscated form. */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    const xored = xorEncode(token, XOR_KEY);
    const b64 = toBase64(xored);
    localStorage.setItem(STORAGE_KEY, `enc:${b64}`);
  },

  /** Remove the stored token. */
  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};

export default tokenStorage;
