import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useEffect, useRef, useState } from 'react';

export default function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasDisconnected, setWasDisconnected] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isConnected) {
      setWasDisconnected(true);
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else if (wasDisconnected) {
      setShowReconnected(true);
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      const timer = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setShowReconnected(false);
          setWasDisconnected(false);
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (isConnected && !showReconnected) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        { opacity },
        isConnected ? styles.reconnected : styles.offline,
      ]}
    >
      <Ionicons
        name={isConnected ? 'wifi' : 'cloud-offline-outline'}
        size={16}
        color={Colors.white}
      />
      <Text style={styles.text}>
        {isConnected ? 'Back online' : 'No internet connection'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
  },
  offline: { backgroundColor: Colors.danger },
  reconnected: { backgroundColor: Colors.success },
  text: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.white },
});
