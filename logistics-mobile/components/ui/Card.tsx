import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadow, FontSize, FontWeight } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
}

export default function Card({
  children,
  title,
  subtitle,
  onPress,
  style,
  headerRight,
  noPadding = false,
}: CardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <Wrapper
      style={[styles.card, noPadding ? styles.noPadding : styles.withPadding, style]}
      {...wrapperProps}
      accessibilityRole={onPress ? 'button' : 'summary'}
      accessibilityLabel={title}
    >
      {(title || headerRight) && (
        <View style={[styles.header, noPadding && { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }]}>
          <View style={styles.headerText}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {headerRight}
        </View>
      )}
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  withPadding: { padding: Spacing.lg },
  noPadding: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  headerText: { flex: 1 },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
