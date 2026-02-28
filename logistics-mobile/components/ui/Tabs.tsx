import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  ScrollView,
} from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface Tab {
  /** Unique key identifying the tab */
  key: string;
  /** Display label */
  label: string;
  /** Optional numeric badge */
  badge?: number;
}

interface TabsProps {
  /** Tab definitions */
  tabs: Tab[];
  /** Currently active tab key */
  activeTab: string;
  /** Called when the user selects a different tab */
  onTabChange: (key: string) => void;
}

/**
 * Horizontal tab bar for content switching.
 * Features an animated underline indicator that slides to the active tab.
 */
export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const tabWidths = useRef<Record<string, number>>({});
  const tabOffsets = useRef<Record<string, number>>({});
  const indicatorLeft = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  // Animate indicator when the active tab changes
  useEffect(() => {
    const offset = tabOffsets.current[activeTab];
    const width = tabWidths.current[activeTab];
    if (offset !== undefined && width !== undefined) {
      Animated.parallel([
        Animated.spring(indicatorLeft, {
          toValue: offset,
          useNativeDriver: false,
          bounciness: 4,
          speed: 14,
        }),
        Animated.spring(indicatorWidth, {
          toValue: width,
          useNativeDriver: false,
          bounciness: 4,
          speed: 14,
        }),
      ]).start();
    }
  }, [activeTab, indicatorLeft, indicatorWidth]);

  const handleLayout = (key: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    tabOffsets.current[key] = x;
    tabWidths.current[key] = width;

    // If this is the active tab, set indicator immediately
    if (key === activeTab) {
      indicatorLeft.setValue(x);
      indicatorWidth.setValue(width);
    }
  };

  return (
    <View style={styles.container} accessibilityRole="tablist">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onLayout={(e) => handleLayout(tab.key, e)}
            style={styles.tab}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
            {tab.badge !== undefined && tab.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Animated underline indicator */}
        <Animated.View
          style={[
            styles.indicator,
            { left: indicatorLeft, width: indicatorWidth },
          ]}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    position: 'relative',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  tabText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  badge: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
});
