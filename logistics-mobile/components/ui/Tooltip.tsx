import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '@/constants/theme';

interface TooltipProps {
  /** Tooltip message text */
  message: string;
  /** The element that triggers the tooltip on long press */
  children: React.ReactNode;
  /** Tooltip position relative to the children */
  position?: 'top' | 'bottom';
  /** Additional style for the wrapper */
  style?: ViewStyle;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Long-press tooltip component.
 * Shows a floating tooltip above or below the children when long-pressed.
 * Automatically dismisses on touch-up or after a timeout.
 */
export default function Tooltip({
  message,
  children,
  position = 'top',
  style,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [childWidth, setChildWidth] = useState(0);

  const show = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 2.5 seconds
    hideTimer.current = setTimeout(() => {
      hide();
    }, 2500);
  }, [opacity]);

  const hide = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, [opacity]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setChildWidth(e.nativeEvent.layout.width);
  };

  const tooltipPositionStyle: ViewStyle =
    position === 'top'
      ? { bottom: '100%', marginBottom: Spacing.xs }
      : { top: '100%', marginTop: Spacing.xs };

  return (
    <View style={[styles.wrapper, style]} onLayout={handleLayout}>
      <TouchableWithoutFeedback
        onLongPress={show}
        onPressOut={hide}
        delayLongPress={400}
        accessibilityRole="text"
        accessibilityHint="Long press to show tooltip"
      >
        <View>{children}</View>
      </TouchableWithoutFeedback>

      {visible && (
        <Animated.View
          style={[
            styles.tooltip,
            tooltipPositionStyle,
            { opacity },
          ]}
          accessibilityRole="alert"
          accessibilityLabel={message}
        >
          <Text style={styles.tooltipText}>{message}</Text>
          {/* Arrow */}
          <View
            style={[
              styles.arrow,
              position === 'top' ? styles.arrowDown : styles.arrowUp,
            ]}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  tooltip: {
    position: 'absolute',
    left: 0,
    backgroundColor: Colors.text,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    maxWidth: SCREEN_WIDTH * 0.7,
    ...Shadow.md,
    zIndex: 999,
  },
  tooltipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: '#ffffff',
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
    left: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowDown: {
    bottom: -6,
    borderTopWidth: 6,
    borderTopColor: Colors.text,
  },
  arrowUp: {
    top: -6,
    borderBottomWidth: 6,
    borderBottomColor: Colors.text,
  },
});
