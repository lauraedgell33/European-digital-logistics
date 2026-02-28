import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

interface SkeletonProps {
  /** Width of the skeleton block (number or percentage string) */
  width?: number | string;
  /** Height of the skeleton block */
  height?: number;
  /** Corner radius */
  borderRadius?: number;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Base shimmer skeleton placeholder.
 * Uses the Animated API to pulse opacity for a loading shimmer effect.
 */
export default function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
    />
  );
}

/**
 * Pre-built skeleton card with title, subtitle, and body line placeholders.
 */
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]} accessibilityRole="progressbar" accessibilityLabel="Loading card">
      <Skeleton width="60%" height={18} />
      <Skeleton width="40%" height={14} style={{ marginTop: Spacing.sm }} />
      <Skeleton width="100%" height={14} style={{ marginTop: Spacing.lg }} />
      <Skeleton width="90%" height={14} style={{ marginTop: Spacing.sm }} />
      <Skeleton width="75%" height={14} style={{ marginTop: Spacing.sm }} />
    </View>
  );
}

/**
 * Pre-built skeleton list — repeating avatar + text rows.
 */
export function SkeletonList({ count = 5, style }: { count?: number; style?: ViewStyle }) {
  return (
    <View style={style} accessibilityRole="progressbar" accessibilityLabel="Loading list">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.listRow}>
          <Skeleton width={40} height={40} borderRadius={BorderRadius.full} />
          <View style={styles.listContent}>
            <Skeleton width="70%" height={16} />
            <Skeleton width="50%" height={12} style={{ marginTop: Spacing.xs }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.surfaceSecondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  listContent: {
    flex: 1,
  },
});
