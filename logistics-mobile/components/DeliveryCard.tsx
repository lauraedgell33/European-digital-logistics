import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import Badge from '@/components/ui/Badge';
import { DeliveryTask } from '@/stores/driverStore';

interface DeliveryCardProps {
  task: DeliveryTask;
  onPress: () => void;
  onNavigate?: () => void;
  onCall?: () => void;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: Colors.warningLight, text: Colors.warningDark, label: 'Pending' },
  en_route: { bg: Colors.infoLight, text: Colors.infoDark, label: 'En Route' },
  arrived: { bg: '#ede9fe', text: '#6d28d9', label: 'Arrived' },
  completed: { bg: Colors.successLight, text: Colors.successDark, label: 'Completed' },
  failed: { bg: Colors.dangerLight, text: Colors.dangerDark, label: 'Failed' },
};

export default function DeliveryCard({ task, onPress, onNavigate, onCall }: DeliveryCardProps) {
  const statusStyle = statusColors[task.status] || statusColors.pending;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.typeChip}>
          <Ionicons
            name={task.type === 'pickup' ? 'arrow-up-circle' : 'arrow-down-circle'}
            size={16}
            color={task.type === 'pickup' ? Colors.info : Colors.success}
          />
          <Text style={[styles.typeText, { color: task.type === 'pickup' ? Colors.info : Colors.success }]}>
            {task.type === 'pickup' ? 'PICKUP' : 'DELIVERY'}
          </Text>
        </View>
        <Badge
          label={statusStyle.label}
          variant={
            task.status === 'completed' ? 'success' :
            task.status === 'failed' ? 'danger' :
            task.status === 'en_route' ? 'info' : 'warning'
          }
        />
      </View>

      <Text style={styles.orderNumber}>#{task.order_number}</Text>
      <Text style={styles.companyName}>{task.company_name}</Text>

      <View style={styles.addressRow}>
        <Ionicons name="location" size={16} color={Colors.textSecondary} />
        <Text style={styles.address} numberOfLines={2}>
          {task.address}, {task.postal_code} {task.city}, {task.country}
        </Text>
      </View>

      {task.scheduled_date && (
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={14} color={Colors.textTertiary} />
          <Text style={styles.infoText}>
            {task.scheduled_date} {task.scheduled_time ? `• ${task.scheduled_time}` : ''}
          </Text>
        </View>
      )}

      {(task.weight || task.pallet_count) && (
        <View style={styles.infoRow}>
          <Ionicons name="cube" size={14} color={Colors.textTertiary} />
          <Text style={styles.infoText}>
            {task.weight ? `${task.weight} kg` : ''}{task.weight && task.pallet_count ? ' • ' : ''}
            {task.pallet_count ? `${task.pallet_count} pallets` : ''}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {onNavigate && task.status !== 'completed' && (
          <TouchableOpacity style={styles.actionBtn} onPress={onNavigate}>
            <Ionicons name="navigate" size={18} color={Colors.primary} />
            <Text style={styles.actionText}>Navigate</Text>
          </TouchableOpacity>
        )}
        {onCall && task.contact_phone && (
          <TouchableOpacity style={styles.actionBtn} onPress={onCall}>
            <Ionicons name="call" size={18} color={Colors.success} />
            <Text style={[styles.actionText, { color: Colors.success }]}>Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  orderNumber: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    marginBottom: 2,
  },
  companyName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  address: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 3,
  },
  infoText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
});
