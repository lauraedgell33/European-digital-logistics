import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import Badge from './ui/Badge';
import { format } from 'date-fns';

interface OrderCardProps {
  orderNumber: string;
  status: string;
  pickupCity: string;
  pickupCountry: string;
  deliveryCity: string;
  deliveryCountry: string;
  price: number;
  currency: string;
  pickupDate: string;
  onPress: () => void;
}

export default function OrderCard({
  orderNumber,
  status,
  pickupCity,
  pickupCountry,
  deliveryCity,
  deliveryCountry,
  price,
  currency,
  pickupDate,
  onPress,
}: OrderCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.orderNumber}>{orderNumber}</Text>
        <Badge label={status.replace(/_/g, ' ')} status={status} />
      </View>

      <View style={styles.route}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          <View>
            <Text style={styles.city}>{pickupCity}</Text>
            <Text style={styles.country}>{pickupCountry}</Text>
          </View>
        </View>
        <View style={styles.routeLine}>
          <Ionicons name="arrow-forward" size={16} color={Colors.textTertiary} />
        </View>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
          <View>
            <Text style={styles.city}>{deliveryCity}</Text>
            <Text style={styles.country}>{deliveryCountry}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.footerText}>
            {format(new Date(pickupDate), 'MMM dd, yyyy')}
          </Text>
        </View>
        <Text style={styles.price}>
          {price.toLocaleString()} {currency}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderNumber: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  city: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  country: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  routeLine: {
    paddingHorizontal: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
});
