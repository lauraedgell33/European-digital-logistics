import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusColors, Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface BadgeProps {
  label: string;
  status?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export default function Badge({ label, status, variant, size = 'sm', showDot = true }: BadgeProps) {
  const statusKey = status || variant || 'default';
  const colors = StatusColors[statusKey] || {
    bg: Colors.surfaceSecondary,
    text: Colors.textSecondary,
    dot: Colors.textTertiary,
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, size === 'md' && styles.badgeMd]}>
      {showDot && <View style={[styles.dot, { backgroundColor: colors.dot }]} />}
      <Text style={[styles.text, { color: colors.text }, size === 'md' && styles.textMd]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: Spacing.xs,
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
  },
  textMd: {
    fontSize: FontSize.sm,
  },
});
