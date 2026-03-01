import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { BorderRadius, Spacing, Shadow, FontSize, FontWeight } from '@/constants/theme';

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
  const { colors } = useColors();
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <Wrapper
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.borderLight },
        noPadding ? styles.noPadding : styles.withPadding,
        style,
      ]}
      {...wrapperProps}
      accessibilityRole={onPress ? 'button' : 'summary'}
      accessibilityLabel={title}
    >
      {(title || headerRight) && (
        <View style={[styles.header, noPadding && { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }]}>
          <View style={styles.headerText}>
            {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
            {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
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
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
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
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
