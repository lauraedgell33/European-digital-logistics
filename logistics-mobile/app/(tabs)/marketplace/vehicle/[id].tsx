import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { vehicleApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ListItem from '@/components/ui/ListItem';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { VehicleOffer } from '@/types';
import { format } from 'date-fns';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const locale = useAppStore((s) => s.locale);

  const { data: vehicle, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const res = await vehicleApi.get(Number(id));
      return (res.data.data || res.data) as VehicleOffer;
    },
    enabled: !!id,
  });

  if (isLoading || !vehicle) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('vehicles.details', locale)}</Text>
        <Badge label={vehicle.status} status={vehicle.status} size="md" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Vehicle Type Card */}
        <Card style={styles.typeCard}>
          <View style={styles.typeHeader}>
            <View style={[styles.typeIcon, { backgroundColor: Colors.infoBg }]}>
              <Ionicons name="bus" size={28} color={Colors.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleType}>{vehicle.vehicle_type}</Text>
              <Text style={styles.refNumber}>#{vehicle.id}</Text>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceValue}>€{vehicle.price_per_km}</Text>
              <Text style={styles.priceUnit}>/km</Text>
            </View>
          </View>
        </Card>

        {/* Location */}
        <Card title={t('vehicles.location', locale)} style={styles.marginTop}>
          <View style={styles.locationRow}>
            <View style={styles.locationCol}>
              <Ionicons name="location" size={18} color={Colors.success} />
              <Text style={styles.locationLabel}>{t('vehicles.currentLocation', locale)}</Text>
              <Text style={styles.locationCity}>{vehicle.current_city}, {vehicle.current_country}</Text>
            </View>
            {vehicle.destination_city && (
              <>
                <Ionicons name="arrow-forward" size={18} color={Colors.textTertiary} style={{ marginTop: Spacing.lg }} />
                <View style={styles.locationCol}>
                  <Ionicons name="flag" size={18} color={Colors.danger} />
                  <Text style={styles.locationLabel}>{t('vehicles.destination', locale)}</Text>
                  <Text style={styles.locationCity}>{vehicle.destination_city}, {vehicle.destination_country}</Text>
                </View>
              </>
            )}
          </View>
        </Card>

        {/* Details */}
        <Card title={t('vehicles.details', locale)} style={styles.marginTop}>
          <ListItem title={t('vehicles.maxWeight', locale)} value={`${vehicle.capacity_kg?.toLocaleString()} kg`} leftIcon="scale-outline" borderBottom />
          {vehicle.capacity_m3 && <ListItem title={t('vehicles.maxVolume', locale)} value={`${vehicle.capacity_m3} m³`} leftIcon="cube-outline" borderBottom />}
          <ListItem title={t('vehicles.availableFrom', locale)} value={format(new Date(vehicle.available_from), 'MMM dd, yyyy')} leftIcon="calendar-outline" borderBottom />
          {vehicle.available_to && (
            <ListItem title={t('vehicles.availableUntil', locale)} value={format(new Date(vehicle.available_to), 'MMM dd, yyyy')} leftIcon="calendar-outline" borderBottom />
          )}
          <ListItem title={t('vehicles.price', locale)} value={`€${vehicle.price_per_km}/km`} leftIcon="cash-outline" borderBottom={false} />
        </Card>

        {/* Equipment */}
        {vehicle.equipment && vehicle.equipment.length > 0 && (
          <Card title={t('vehicles.equipment', locale)} style={styles.marginTop}>
            <View style={styles.equipmentList}>
              {vehicle.equipment.map((eq: string, idx: number) => (
                <View key={idx} style={styles.equipmentBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                  <Text style={styles.equipmentText}>{eq}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Company */}
        {vehicle.company && (
          <Card title={t('vehicles.company', locale)} style={styles.marginTop}>
            <View style={styles.companyRow}>
              <View style={styles.companyIcon}>
                <Ionicons name="business" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.companyName}>{vehicle.company.name}</Text>
                <Text style={styles.companyCountry}>{vehicle.company.country}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Description */}
        {vehicle.notes && (
          <Card title={t('common.description', locale)} style={styles.marginTop}>
            <Text style={styles.descriptionText}>{vehicle.notes}</Text>
          </Card>
        )}

        <View style={{ height: Spacing.xxxl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg, gap: Spacing.md },
  backBtn: { marginRight: Spacing.sm },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.xxl },
  typeCard: { marginBottom: 0 },
  typeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  typeIcon: { width: 56, height: 56, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  vehicleType: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  refNumber: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  priceTag: { flexDirection: 'row', alignItems: 'baseline' },
  priceValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary },
  priceUnit: { fontSize: FontSize.sm, color: Colors.textSecondary },
  marginTop: { marginTop: Spacing.lg },
  locationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.lg },
  locationCol: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  locationLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, textTransform: 'uppercase' },
  locationCity: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, textAlign: 'center' },
  equipmentList: { gap: Spacing.sm },
  equipmentBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  equipmentText: { fontSize: FontSize.md, color: Colors.text },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  companyIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center' },
  companyName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  companyCountry: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  descriptionText: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },
});
