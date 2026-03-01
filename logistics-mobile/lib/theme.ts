import { useColorScheme } from 'react-native';
import {
  LightColors,
  DarkColors,
  getColors,
  getStatusColors,
} from '@/constants/theme';

/**
 * Geist Design System — Light & Dark Theme Colors
 * Auto-synchronized with shared/design-tokens.json via generate-rn.js
 * DO NOT edit colors here — edit design-tokens.json and run `npm run generate:rn`
 */

export const LightThemeColors = LightColors;

export const DarkThemeColors = DarkColors;

export type ThemeColors = typeof LightThemeColors;

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors: ThemeColors = isDark ? DarkThemeColors : LightThemeColors;

  return {
    colors,
    isDark,
    colorScheme: colorScheme ?? 'light',
    statusColors: getStatusColors(colorScheme),
  };
}
