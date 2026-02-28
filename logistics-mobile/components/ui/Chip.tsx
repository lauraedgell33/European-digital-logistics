import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface ChipProps {
  /** Label text */
  label: string;
  /** Whether this chip is selected / active */
  selected?: boolean;
  /** Called when the chip body is tapped */
  onPress?: () => void;
  /** Called when the dismiss (×) button is tapped */
  onDismiss?: () => void;
  /** Optional leading Ionicons icon name */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Visual variant */
  variant?: 'filled' | 'outlined';
  /** Additional container styles */
  style?: ViewStyle;
}

/**
 * Selectable tag / chip component.
 * Supports filled / outlined variants, an optional leading icon,
 * and an optional dismiss (×) button for removable chips.
 */
export default function Chip({
  label,
  selected = false,
  onPress,
  onDismiss,
  icon,
  variant = 'outlined',
  style,
}: ChipProps) {
  const isFilled = variant === 'filled' || selected;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isFilled ? styles.chipFilled : styles.chipOutlined,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={isFilled ? '#ffffff' : Colors.primary}
        />
      )}
      <Text style={[styles.label, isFilled ? styles.labelFilled : styles.labelOutlined]}>
        {label}
      </Text>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
        >
          <Ionicons
            name="close-circle"
            size={16}
            color={isFilled ? 'rgba(255,255,255,0.7)' : Colors.textTertiary}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  chipFilled: {
    backgroundColor: Colors.primary,
  },
  chipOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  labelFilled: {
    color: '#ffffff',
  },
  labelOutlined: {
    color: Colors.text,
  },
});
