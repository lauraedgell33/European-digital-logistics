import { useMemo } from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';
import { getColors, getStatusColors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/theme';

/**
 * Convenience hook for theme-aware colors in any component.
 *
 * Usage:
 *   const { colors, isDark, statusColors } = useColors();
 *   <View style={{ backgroundColor: colors.surface }} />
 */
export function useColors() {
  const { colors, isDark, colorScheme, statusColors, themeMode, setThemeMode } = useThemeContext();
  return { colors, isDark, colorScheme, statusColors, themeMode, setThemeMode };
}

/**
 * Hook that returns dynamic styles computed from the current theme.
 *
 * Usage:
 *   const styles = useThemedStyles((colors) => StyleSheet.create({
 *     card: { backgroundColor: colors.surface }
 *   }));
 */
export function useThemedStyles<T>(factory: (colors: ReturnType<typeof getColors>) => T): T {
  const { colors } = useThemeContext();
  return useMemo(() => factory(colors as ReturnType<typeof getColors>), [colors]);
}
