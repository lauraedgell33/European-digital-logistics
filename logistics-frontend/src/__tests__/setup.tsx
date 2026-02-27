import '@testing-library/jest-dom';

// ── Mock next/navigation ──────────────────────────────
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockRefresh = jest.fn();
const mockPrefetch = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    refresh: mockRefresh,
    prefetch: mockPrefetch,
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// ── Mock next/image ───────────────────────────────────
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// ── Mock next/link ────────────────────────────────────
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

// ── Mock cookies helpers ──────────────────────────────
jest.mock('@/lib/cookies', () => ({
  setAuthCookie: jest.fn(),
  removeAuthCookie: jest.fn(),
  getAuthCookie: jest.fn(() => null),
}));

// ── Mock reCAPTCHA hook ───────────────────────────────
jest.mock('@/hooks/useRecaptcha', () => ({
  useRecaptcha: () => ({
    execute: jest.fn().mockResolvedValue('mock-recaptcha-token'),
    isEnabled: false,
  }),
}));

// ── Global helpers for next/navigation mocks ──────────
export { mockPush, mockReplace, mockBack, mockRefresh, mockPrefetch };

// ── Reset mocks between tests ─────────────────────────
beforeEach(() => {
  mockPush.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
  mockRefresh.mockClear();
  mockPrefetch.mockClear();
  localStorage.clear();
});
