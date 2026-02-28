import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface ProgressProps {
  /** Progress value between 0 and 100 */
  value: number;
  /** Visual variant */
  variant?: 'bar' | 'circular';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Fill color (defaults to primary) */
  color?: string;
  /** Whether to display the percentage label */
  showLabel?: boolean;
  /** Additional container styles */
  style?: ViewStyle;
}

/**
 * Animated progress indicator — supports bar and circular variants.
 * The bar variant animates width smoothly; the circular variant uses a
 * simplified border-based arc display.
 */
export default function Progress({
  value,
  variant = 'bar',
  size = 'md',
  color = Colors.primary,
  showLabel = false,
  style,
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clampedValue,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [clampedValue, animatedWidth]);

  // ── Circular variant ─────────────────────────────────────────────────
  if (variant === 'circular') {
    const circleSize = { sm: 48, md: 64, lg: 80 }[size];
    const strokeWidth = { sm: 3, md: 4, lg: 5 }[size];
    const labelSize = { sm: FontSize.xs, md: FontSize.sm, lg: FontSize.md }[size];

    return (
      <View
        style={[styles.circularContainer, { width: circleSize, height: circleSize }, style]}
        accessibilityRole="progressbar"
        accessibilityLabel={`${clampedValue}% complete`}
        accessibilityValue={{ min: 0, max: 100, now: clampedValue }}
      >
        {/* Background track */}
        <View
          style={[
            styles.circularTrack,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              borderWidth: strokeWidth,
            },
          ]}
        />
        {/* Progress arc approximation via quarter-border trick */}
        <View
          style={[
            styles.circularProgress,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: clampedValue > 25 ? color : 'transparent',
              borderRightColor: clampedValue > 50 ? color : 'transparent',
              borderBottomColor: clampedValue > 75 ? color : 'transparent',
              borderLeftColor: clampedValue > 0 ? color : 'transparent',
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
        <Text style={[styles.circularLabel, { fontSize: labelSize }]}>
          {Math.round(clampedValue)}%
        </Text>
      </View>
    );
  }

  // ── Bar variant ───────────────────────────────────────────────────────
  const barHeight = { sm: 4, md: 8, lg: 12 }[size];

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[styles.barContainer, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={`${clampedValue}% complete`}
      accessibilityValue={{ min: 0, max: 100, now: clampedValue }}
    >
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>{Math.round(clampedValue)}%</Text>
        </View>
      )}
      <View style={[styles.track, { height: barHeight }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              height: barHeight,
              backgroundColor: color,
              width: widthInterpolation,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {},
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
  },
  labelText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  track: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularTrack: {
    position: 'absolute',
    borderColor: Colors.surfaceSecondary,
  },
  circularProgress: {
    position: 'absolute',
  },
  circularLabel: {
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
});
