import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import Badge from './ui/Badge';

import { VehicleOffer } from '@/types';

export interface VehicleCardProps {
  vehicleType?: string;
  capacityKg?: number;
  currentCity?: string;
  currentCountry?: string;
  destinationCity?: string;
  destinationCountry?: string;
  availableFrom?: string;
  pricePerKm?: number;
  flatPrice?: number;
  currency?: string;
  status?: string;
  equipment?: string[];
  companyName?: string;
  vehicle?: VehicleOffer;
  onPress: () => void;
}

export default function VehicleCard(props: VehicleCardProps) {
  const { vehicle, onPress } = props;
  const vehicleType = props.vehicleType || vehicle?.vehicle_type || '';
  const capacityKg = props.capacityKg || vehicle?.capacity_kg || 0;
  const currentCity = props.currentCity || vehicle?.current_city || '';
  const currentCountry = props.currentCountry || vehicle?.current_country || '';
  const destinationCity = props.destinationCity || vehicle?.destination_city;
  const destinationCountry = props.destinationCountry || vehicle?.destination_country;
  const availableFrom = props.availableFrom || vehicle?.available_from || '';
  const pricePerKm = props.pricePerKm || vehicle?.price_per_km;
  const flatPrice = props.flatPrice || vehicle?.flat_price;
  const currency = props.currency || vehicle?.currency || 'EUR';
  const status = props.status || vehicle?.status || '';
  const equipment = props.equipment || vehicle?.equipment;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Ionicons name="bus" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.vehicleType}>{vehicleType}</Text>
            <Text style={styles.capacity}>{capacityKg.toLocaleString()} kg</Text>
          </View>
        </View>
        <Badge label={status} status={status} />
      </View>

      <View style={styles.locationRow}>
        <View style={styles.locationItem}>
          <Ionicons name="location" size={16} color={Colors.success} />
          <Text style={styles.locationText}>{currentCity}, {currentCountry}</Text>
        </View>
        {destinationCity && (
          <View style={styles.locationItem}>
            <Ionicons name="flag" size={16} color={Colors.danger} />
            <Text style={styles.locationText}>{destinationCity}, {destinationCountry}</Text>
          </View>
        )}
      </View>

      {equipment && equipment.length > 0 && (
        <View style={styles.equipmentRow}>
          {equipment.slice(0, 3).map((eq, i) => (
            <View key={i} style={styles.equipmentBadge}>
              <Text style={styles.equipmentText}>{eq}</Text>
            </View>
          ))}
          {equipment.length > 3 && (
            <Text style={styles.moreText}>+{equipment.length - 3}</Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.date}>From: {availableFrom}</Text>
        <Text style={styles.price}>
          {pricePerKm ? `${pricePerKm} ${currency}/km` : flatPrice ? `${flatPrice.toLocaleString()} ${currency}` : 'Negotiable'}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleType: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  capacity: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  locationRow: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  locationText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  equipmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  equipmentBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs - 1,
    borderRadius: BorderRadius.sm,
  },
  equipmentText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  moreText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  date: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  price: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
});
