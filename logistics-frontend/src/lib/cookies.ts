/**
 * Secure cookie helpers for auth token management.
 *
 * In production, cookies are set with:
 *  - Secure (HTTPS only)
 *  - SameSite=Lax (CSRF protection)
 *  - Path=/
 *  - Max-Age=86400 (24 hours)
 */

const COOKIE_NAME = 'auth_token';
const MAX_AGE = 86400; // 24 hours in seconds

function isSecure(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:';
}

/**
 * Set the auth token cookie with proper security flags.
 */
export function setAuthCookie(token: string): void {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    `path=/`,
    `max-age=${MAX_AGE}`,
    `SameSite=Lax`,
  ];

  if (isSecure()) {
    parts.push('Secure');
  }

  document.cookie = parts.join('; ');
}

/**
 * Remove the auth token cookie (set expired).
 */
export function removeAuthCookie(): void {
  const parts = [
    `${COOKIE_NAME}=`,
    `path=/`,
    `expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    `SameSite=Lax`,
  ];

  if (isSecure()) {
    parts.push('Secure');
  }

  document.cookie = parts.join('; ');
}

/**
 * Get the auth token from cookies (client-side).
 */
export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`)
  );

  return match ? decodeURIComponent(match[1]) : null;
}
