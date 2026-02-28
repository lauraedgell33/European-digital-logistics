import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  value?: string;
  valueColor?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  leftIconBg?: string;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
  arrow?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  borderBottom?: boolean;
}

export default function ListItem({
  title,
  subtitle,
  value,
  valueColor,
  leftIcon,
  leftIconColor = Colors.primary,
  leftIconBg = Colors.primaryBg,
  rightElement,
  showArrow = false,
  arrow,
  onPress,
  style,
  borderBottom = true,
}: ListItemProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.6 } : {};
  const showChevron = showArrow || arrow;

  return (
    <Wrapper
      style={[styles.container, borderBottom && styles.border, style]}
      {...wrapperProps}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={title}
      accessibilityHint={onPress ? 'Double tap to open' : undefined}
    >
      {leftIcon && (
        <View style={[styles.iconContainer, { backgroundColor: leftIconBg }]}>
          <Ionicons name={leftIcon} size={20} color={leftIconColor} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {value && (
        <Text style={[styles.value, valueColor && { color: valueColor }]} numberOfLines={1}>
          {value}
        </Text>
      )}
      {rightElement}
      {showChevron && <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  value: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
});
