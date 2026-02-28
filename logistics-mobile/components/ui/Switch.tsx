import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface SwitchProps {
  /** Whether the switch is on */
  value: boolean;
  /** Called when the user toggles the switch */
  onValueChange: (value: boolean) => void;
  /** Disable interaction */
  disabled?: boolean;
  /** Optional label displayed to the left of the switch */
  label?: string;
}

/**
 * Animated toggle switch with smooth thumb sliding.
 * Uses the Animated API for spring-based transitions.
 */
export default function Switch({
  value,
  onValueChange,
  disabled = false,
  label,
}: SwitchProps) {
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 20 : 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 16,
    }).start();
  }, [value, translateX]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label || 'Toggle'}
      accessibilityState={{ checked: value, disabled }}
    >
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      )}
      <View
        style={[
          styles.track,
          value ? styles.trackActive : styles.trackInactive,
          disabled && styles.trackDisabled,
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX }] },
            disabled && styles.thumbDisabled,
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.md,
  },
  labelDisabled: {
    color: Colors.textTertiary,
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  trackActive: {
    backgroundColor: Colors.primary,
  },
  trackInactive: {
    backgroundColor: Colors.border,
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbDisabled: {
    backgroundColor: Colors.surfaceSecondary,
  },
});
