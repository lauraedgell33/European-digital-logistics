import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

type ThemeMode = 'system' | 'light' | 'dark';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
  { mode: 'system', label: 'System', icon: 'phone-portrait-outline', description: 'Follow device settings' },
  { mode: 'light', label: 'Light', icon: 'sunny-outline', description: 'Always light mode' },
  { mode: 'dark', label: 'Dark', icon: 'moon-outline', description: 'Always dark mode' },
];

export default function ThemeSettings() {
  const { colors, themeMode, setThemeMode, isDark } = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        Choose your preferred theme
      </Text>

      <View style={styles.optionsRow}>
        {THEME_OPTIONS.map((option) => {
          const isActive = themeMode === option.mode;
          return (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.option,
                {
                  backgroundColor: isActive ? colors.primaryBg : colors.surfaceSecondary,
                  borderColor: isActive ? colors.primary : colors.borderLight,
                },
              ]}
              onPress={() => setThemeMode(option.mode)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={`${option.label} theme`}
              testID={`theme-${option.mode}`}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surfaceSecondary,
                  },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={22}
                  color={isActive ? '#fff' : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  { color: isActive ? colors.primary : colors.text },
                ]}
              >
                {option.label}
              </Text>
              <Text style={[styles.optionDesc, { color: colors.textTertiary }]}>
                {option.description}
              </Text>
              {isActive && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.currentTheme, { backgroundColor: colors.surfaceSecondary }]}>
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={16}
          color={isDark ? colors.warning : colors.primary}
        />
        <Text style={[styles.currentThemeText, { color: colors.textSecondary }]}>
          Currently using {isDark ? 'dark' : 'light'} mode
          {themeMode === 'system' ? ' (system)' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    position: 'relative',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  optionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 10,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentTheme: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  currentThemeText: {
    fontSize: FontSize.sm,
  },
});
