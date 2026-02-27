import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '@/constants/theme';
import { useAppStore } from '@/stores/appStore';

const typeConfig = {
  success: { icon: 'checkmark-circle' as const, bg: Colors.successLight, color: Colors.successDark, border: Colors.success },
  error: { icon: 'close-circle' as const, bg: Colors.dangerLight, color: Colors.dangerDark, border: Colors.danger },
  warning: { icon: 'warning' as const, bg: Colors.warningLight, color: Colors.warningDark, border: Colors.warning },
  info: { icon: 'information-circle' as const, bg: Colors.infoLight, color: Colors.infoDark, border: Colors.info },
};

export default function Toast() {
  const notifications = useAppStore((s) => s.notifications);
  const removeNotification = useAppStore((s) => s.removeNotification);

  if (notifications.length === 0) return null;

  return (
    <View style={styles.container}>
      {notifications.map((n) => {
        const config = typeConfig[n.type] || typeConfig.info;
        return (
          <TouchableOpacity
            key={n.id}
            style={[styles.toast, { backgroundColor: config.bg, borderLeftColor: config.border }]}
            onPress={() => removeNotification(n.id)}
            activeOpacity={0.9}
          >
            <Ionicons name={config.icon} size={22} color={config.color} />
            <View style={styles.content}>
              {n.title && <Text style={[styles.title, { color: config.color }]}>{n.title}</Text>}
              {n.message && <Text style={[styles.message, { color: config.color }]}>{n.message}</Text>}
            </View>
            <Ionicons name="close" size={18} color={config.color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 9999,
    gap: Spacing.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  content: { flex: 1 },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  message: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
