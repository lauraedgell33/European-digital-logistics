import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
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
  const { colors } = useColors();
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
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="cube" size={18} color={colors.primary} />
          <Text style={[styles.cargoType, { color: colors.text }]}>{cargoType}</Text>
        </View>
        <Badge label={status} status={status} />
      </View>

      <View style={[styles.route, { backgroundColor: colors.primaryBg }]}>
        <View style={styles.location}>
          <Text style={[styles.city, { color: colors.text }]}>{originCity}</Text>
          <Text style={[styles.country, { color: colors.textSecondary }]}>{originCountry}</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={colors.primaryLight} />
        <View style={[styles.location, { alignItems: 'flex-end' }]}>
          <Text style={[styles.city, { color: colors.text }]}>{destinationCity}</Text>
          <Text style={[styles.country, { color: colors.textSecondary }]}>{destinationCountry}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="scale-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{weight.toLocaleString()} kg</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{format(new Date(loadingDate), 'MMM dd')}</Text>
        </View>
        {price && (
          <Text style={[styles.price, { color: colors.primary }]}>
            {price.toLocaleString()} {currency}
          </Text>
        )}
      </View>

      {companyName && (
        <View style={[styles.companyRow, { borderTopColor: colors.borderLight }]}>
          <Ionicons name="business-outline" size={12} color={colors.textTertiary} />
          <Text style={[styles.companyName, { color: colors.textTertiary }]}>{companyName}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
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
    textTransform: 'capitalize',
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  location: {},
  city: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  country: {
    fontSize: FontSize.xs,
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
  },
  price: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginLeft: 'auto',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  companyName: {
    fontSize: FontSize.xs,
  },
});
