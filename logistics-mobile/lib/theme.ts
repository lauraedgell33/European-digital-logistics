import { useColorScheme } from 'react-native';

/**
 * Geist Design System — Light & Dark Theme Colors
 * Synchronized with frontend's Geist/Vercel-inspired design system
 */

export const LightThemeColors = {
  // Primary — Geist Blue
  primary: '#0070f3',
  primaryLight: '#7ab8ff',
  primaryDark: '#0050b3',
  primaryBg: '#f0f7ff',

  // Secondary — purple accent
  secondary: '#6c63ff',
  secondaryLight: '#8b84ff',

  // Status — Geist
  success: '#45a557',
  successLight: '#eef9f0',
  successDark: '#297a32',

  warning: '#f5a623',
  warningLight: '#fff8e6',
  warningDark: '#a35200',

  danger: '#e5484d',
  dangerLight: '#fff5f5',
  dangerDark: '#cd2b31',

  info: '#52a8ff',
  infoLight: '#f0f7ff',
  infoDark: '#0050b3',
  infoBg: '#f0f7ff',

  // Surfaces — Geist
  white: '#ffffff',
  card: '#ffffff',
  background: '#fafafa',
  surface: '#ffffff',
  surfaceSecondary: '#f2f2f2',
  neutralLight: '#f2f2f2',
  border: '#ebebeb',
  borderLight: '#f2f2f2',
  divider: '#ebebeb',

  // Text — Geist
  text: '#171717',
  textSecondary: '#7d7d7d',
  textTertiary: '#a8a8a8',
  textInverse: '#ffffff',
  textLink: '#0070f3',

  // Status — Geist
  statusActive: '#45a557',
  statusPending: '#f5a623',
  statusInTransit: '#0070f3',
  statusCompleted: '#45a557',
  statusCancelled: '#e5484d',
  statusDraft: '#a8a8a8',
  statusRejected: '#e5484d',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

export const DarkThemeColors = {
  // Primary — Geist Blue bright
  primary: '#3291ff',
  primaryLight: '#52a8ff',
  primaryDark: '#0070f3',
  primaryBg: '#0d1f3c',

  // Secondary
  secondary: '#8b84ff',
  secondaryLight: '#a99eff',

  // Status — Geist dark variants
  success: '#5fba68',
  successLight: '#0f2e14',
  successDark: '#b8e5c0',

  warning: '#ffd580',
  warningLight: '#2e1f00',
  warningDark: '#ffeecc',

  danger: '#ff6166',
  dangerLight: '#3d0d0f',
  dangerDark: '#ffbdbd',

  info: '#7ab8ff',
  infoLight: '#0d1f3c',
  infoDark: '#d4e4ff',
  infoBg: '#0d1f3c',

  // Surfaces — Geist dark
  white: '#1a1a1a',
  card: '#1a1a1a',
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceSecondary: '#2e2e2e',
  neutralLight: '#2e2e2e',
  border: '#333333',
  borderLight: '#2e2e2e',
  divider: '#333333',

  // Text — Geist dark
  text: '#ededed',
  textSecondary: '#a8a8a8',
  textTertiary: '#666666',
  textInverse: '#171717',
  textLink: '#3291ff',

  // Status — Geist dark
  statusActive: '#5fba68',
  statusPending: '#ffd580',
  statusInTransit: '#3291ff',
  statusCompleted: '#5fba68',
  statusCancelled: '#ff6166',
  statusDraft: '#666666',
  statusRejected: '#ff6166',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export type ThemeColors = typeof LightThemeColors;

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors: ThemeColors = isDark ? DarkThemeColors : LightThemeColors;

  return {
    colors,
    isDark,
    colorScheme: colorScheme ?? 'light',
  };
}
