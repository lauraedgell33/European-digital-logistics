import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import Badge from './ui/Badge';
import { format } from 'date-fns';

import { FreightOffer } from '@/types';

export interface FreightCardProps {
  id?: number;
  originCity?: string;
  originCountry?: string;
  destinationCity?: string;
  destinationCountry?: string;
  cargoType?: string;
  weight?: number;
  loadingDate?: string;
  price?: number;
  currency?: string;
  priceType?: string;
  status?: string;
  companyName?: string;
  freight?: FreightOffer;
  onPress: () => void;
}

export default function FreightCard(props: FreightCardProps) {
  const { freight, onPress } = props;
  const originCity = props.originCity || freight?.origin_city || '';
  const originCountry = props.originCountry || freight?.origin_country || '';
  const destinationCity = props.destinationCity || freight?.destination_city || '';
  const destinationCountry = props.destinationCountry || freight?.destination_country || '';
  const cargoType = props.cargoType || freight?.cargo_type || '';
  const weight = props.weight || freight?.weight || 0;
  const loadingDate = props.loadingDate || freight?.loading_date || '';
  const price = props.price || freight?.price;
  const currency = props.currency || freight?.currency || 'EUR';
  const status = props.status || freight?.status || '';
  const companyName = props.companyName || freight?.company?.name;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="cube" size={18} color={Colors.primary} />
          <Text style={styles.cargoType}>{cargoType}</Text>
        </View>
        <Badge label={status} status={status} />
      </View>

      <View style={styles.route}>
        <View style={styles.location}>
          <Text style={styles.city}>{originCity}</Text>
          <Text style={styles.country}>{originCountry}</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={Colors.primaryLight} />
        <View style={[styles.location, { alignItems: 'flex-end' }]}>
          <Text style={styles.city}>{destinationCity}</Text>
          <Text style={styles.country}>{destinationCountry}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="scale-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{weight.toLocaleString()} kg</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{format(new Date(loadingDate), 'MMM dd')}</Text>
        </View>
        {price && (
          <Text style={styles.price}>
            {price.toLocaleString()} {currency}
          </Text>
        )}
      </View>

      {companyName && (
        <View style={styles.companyRow}>
          <Ionicons name="business-outline" size={12} color={Colors.textTertiary} />
          <Text style={styles.companyName}>{companyName}</Text>
        </View>
      )}
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
    gap: Spacing.sm,
  },
  cargoType: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  location: {},
  city: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  country: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  price: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginLeft: 'auto',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  companyName: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
});
