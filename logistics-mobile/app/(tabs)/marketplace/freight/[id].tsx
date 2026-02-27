import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { freightApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ListItem from '@/components/ui/ListItem';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { FreightOffer } from '@/types';
import { format } from 'date-fns';

export default function FreightDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const locale = useAppStore((s) => s.locale);

  const { data: freight, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['freight', id],
    queryFn: async () => {
      const res = await freightApi.get(Number(id));
      return (res.data.data || res.data) as FreightOffer;
    },
    enabled: !!id,
  });

  if (isLoading || !freight) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('freight.details', locale)}</Text>
        <Badge label={freight.status} status={freight.status} size="md" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Route */}
        <Card style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <View style={[styles.routeIcon, { backgroundColor: Colors.primaryBg }]}>
              <Ionicons name="cube" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cargoType}>{freight.cargo_type}</Text>
              <Text style={styles.refNumber}>#{freight.id}</Text>
            </View>
          </View>
          <View style={styles.routeRow}>
            <View style={styles.routePointCol}>
              <View style={[styles.dot, { backgroundColor: Colors.success }]} />
              <View style={styles.routeLine} />
              <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
            </View>
            <View style={styles.routeDetails}>
              <View>
                <Text style={styles.routeLabel}>{t('freight.origin', locale)}</Text>
                <Text style={styles.routeCity}>{freight.origin_city}, {freight.origin_country}</Text>
              </View>
              <View style={{ marginTop: Spacing.xl }}>
                <Text style={styles.routeLabel}>{t('freight.destination', locale)}</Text>
                <Text style={styles.routeCity}>{freight.destination_city}, {freight.destination_country}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Details */}
        <Card title={t('freight.details', locale)} style={styles.marginTop}>
          <ListItem title={t('freight.weight', locale)} value={`${freight.weight?.toLocaleString()} kg`} leftIcon="scale-outline" borderBottom />
          {freight.volume && <ListItem title={t('freight.volume', locale)} value={`${freight.volume} m³`} leftIcon="cube-outline" borderBottom />}
          <ListItem title={t('freight.loadingDate', locale)} value={format(new Date(freight.loading_date), 'MMM dd, yyyy')} leftIcon="calendar-outline" borderBottom />
          {freight.unloading_date && (
            <ListItem title={t('freight.unloadingDate', locale)} value={format(new Date(freight.unloading_date), 'MMM dd, yyyy')} leftIcon="calendar-outline" borderBottom />
          )}
          <ListItem title={t('freight.price', locale)} value={`€${freight.price?.toLocaleString()}`} leftIcon="cash-outline" borderBottom={false} />
        </Card>

        {/* Equipment */}
        {freight.required_equipment && freight.required_equipment.length > 0 && (
          <Card title={t('freight.equipment', locale)} style={styles.marginTop}>
            <View style={styles.equipmentList}>
              {freight.required_equipment.map((eq: string, idx: number) => (
                <View key={idx} style={styles.equipmentBadge}>
                  <Text style={styles.equipmentText}>{eq}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Company */}
        {freight.company && (
          <Card title={t('freight.company', locale)} style={styles.marginTop}>
            <View style={styles.companyRow}>
              <View style={styles.companyIcon}>
                <Ionicons name="business" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.companyName}>{freight.company.name}</Text>
                <Text style={styles.companyCountry}>{freight.company.country}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Description */}
        {freight.notes && (
          <Card title={t('common.description', locale)} style={styles.marginTop}>
            <Text style={styles.descriptionText}>{freight.notes}</Text>
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
  routeCard: { marginBottom: 0 },
  routeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  routeIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  cargoType: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  refNumber: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  routeRow: { flexDirection: 'row', gap: Spacing.lg },
  routePointCol: { alignItems: 'center', paddingTop: 4 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  routeLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: Spacing.xs },
  routeDetails: { flex: 1 },
  routeLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  routeCity: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, marginTop: 2 },
  marginTop: { marginTop: Spacing.lg },
  equipmentList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  equipmentBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, backgroundColor: Colors.primaryBg, borderRadius: BorderRadius.full },
  equipmentText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  companyIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center' },
  companyName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  companyCountry: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  descriptionText: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },
});
