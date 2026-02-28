import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType, ViewStyle } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/theme';

interface AvatarProps {
  /** Image source — URI string or require() asset */
  source?: ImageSourcePropType | string;
  /** Full name (used for initials fallback and deterministic bg color) */
  name?: string;
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Optional presence badge */
  badge?: 'online' | 'offline' | 'busy';
  /** Additional container styles */
  style?: ViewStyle;
}

const sizeMap = { sm: 32, md: 44, lg: 64 };
const fontSizeMap = { sm: FontSize.xs, md: FontSize.md, lg: FontSize.xl };
const badgeSizeMap = { sm: 8, md: 12, lg: 16 };

const badgeColorMap = {
  online: Colors.success,
  offline: Colors.textTertiary,
  busy: Colors.danger,
};

/** Extract up to two initials from a full name */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
}

/** Deterministic palette color based on name hash */
function getAvatarColor(name: string): string {
  const palette = [
    Colors.primary,
    Colors.secondary,
    Colors.success,
    Colors.warning,
    Colors.danger,
    Colors.info,
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

/**
 * User avatar with image support and initials fallback.
 * Circular shape with optional online/offline/busy presence badge.
 */
export default function Avatar({ source, name, size = 'md', badge, style }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];
  const badgeSize = badgeSizeMap[size];
  const showImage = source && !imageError;
  const imageSource = typeof source === 'string' ? { uri: source } : source;

  return (
    <View
      style={[styles.container, { width: dimension, height: dimension }, style]}
      accessibilityRole="image"
      accessibilityLabel={name ? `Avatar of ${name}` : 'User avatar'}
    >
      {showImage ? (
        <Image
          source={imageSource as ImageSourcePropType}
          style={[
            styles.image,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: name ? getAvatarColor(name) : Colors.surfaceSecondary,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>
            {name ? getInitials(name) : '?'}
          </Text>
        </View>
      )}
      {badge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColorMap[badge],
              borderWidth: size === 'sm' ? 1 : 2,
            },
          ]}
          accessibilityLabel={`Status: ${badge}`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    ...Shadow.sm,
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#ffffff',
    fontWeight: FontWeight.semibold,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: Colors.surface,
  },
});
