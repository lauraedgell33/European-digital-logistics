import { useColorScheme } from 'react-native';

export const LightThemeColors = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  primaryDark: '#1e3a8a',
  primaryBg: '#eff6ff',

  secondary: '#6366f1',
  secondaryLight: '#818cf8',

  success: '#10b981',
  successLight: '#d1fae5',
  successDark: '#065f46',

  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#92400e',

  danger: '#ef4444',
  dangerLight: '#fee2e2',
  dangerDark: '#991b1b',

  info: '#06b6d4',
  infoLight: '#cffafe',
  infoDark: '#155e75',
  infoBg: '#ecfeff',

  // Surfaces
  white: '#ffffff',
  card: '#ffffff',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceSecondary: '#f1f5f9',
  neutralLight: '#f1f5f9',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  divider: '#e2e8f0',

  // Text
  text: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  textInverse: '#ffffff',
  textLink: '#2563eb',

  // Status
  statusActive: '#10b981',
  statusPending: '#f59e0b',
  statusInTransit: '#3b82f6',
  statusCompleted: '#10b981',
  statusCancelled: '#ef4444',
  statusDraft: '#94a3b8',
  statusRejected: '#ef4444',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

export const DarkThemeColors = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#1e40af',
  primaryBg: '#1e293b',

  secondary: '#818cf8',
  secondaryLight: '#a5b4fc',

  success: '#34d399',
  successLight: '#064e3b',
  successDark: '#6ee7b7',

  warning: '#fbbf24',
  warningLight: '#78350f',
  warningDark: '#fde68a',

  danger: '#f87171',
  dangerLight: '#7f1d1d',
  dangerDark: '#fca5a5',

  info: '#22d3ee',
  infoLight: '#164e63',
  infoDark: '#67e8f9',
  infoBg: '#0c4a6e',

  // Surfaces
  white: '#1e293b',
  card: '#1e293b',
  background: '#0f172a',
  surface: '#1e293b',
  surfaceSecondary: '#334155',
  neutralLight: '#334155',
  border: '#475569',
  borderLight: '#334155',
  divider: '#475569',

  // Text
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  textInverse: '#0f172a',
  textLink: '#60a5fa',

  // Status
  statusActive: '#34d399',
  statusPending: '#fbbf24',
  statusInTransit: '#60a5fa',
  statusCompleted: '#34d399',
  statusCancelled: '#f87171',
  statusDraft: '#64748b',
  statusRejected: '#f87171',

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
