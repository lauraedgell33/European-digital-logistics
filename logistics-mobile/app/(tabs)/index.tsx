import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { useColors } from '@/hooks/useColors';
import { t } from '@/lib/i18n';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { DashboardData, TransportOrder } from '@/types';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');
const cardWidth = (width - Spacing.xxl * 2 - Spacing.md) / 2;

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const locale = useAppStore((s) => s.locale);
  const { colors } = useColors();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboardApi.index();
      return res.data as DashboardData;
    },
  });

  const overview = data?.overview;

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {t('dashboard.welcome', locale)}, {user?.name?.split(' ')[0]} 👋
          </Text>
          <Text style={[styles.companyName, { color: colors.textSecondary }]}>{user?.company?.name}</Text>
        </View>
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/(tabs)/profile' as any)}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title={t('dashboard.activeOrders', locale)}
            value={overview?.active_orders || 0}
            icon="cube"
            color={colors.primary}
            bgColor={colors.primaryBg}
            style={{ width: cardWidth }}
          />
          <StatCard
            title={t('dashboard.pendingOrders', locale)}
            value={overview?.pending_orders || 0}
            icon="time"
            color={colors.warning}
            bgColor={colors.warningLight}
            style={{ width: cardWidth }}
          />
          <StatCard
            title={t('dashboard.freightOffers', locale)}
            value={overview?.active_freight_offers || 0}
            icon="cube-outline"
            color={colors.info}
            bgColor={colors.infoLight}
            style={{ width: cardWidth }}
          />
          <StatCard
            title={t('dashboard.vehicleOffers', locale)}
            value={overview?.active_vehicle_offers || 0}
            icon="bus-outline"
            color={colors.secondary}
            bgColor={colors.infoBg}
            style={{ width: cardWidth }}
          />
        </View>

        {/* Revenue Card */}
        <Card style={styles.revenueCard}>
          <View style={styles.revenueRow}>
            <View>
              <Text style={[styles.revenueLabel, { color: colors.textSecondary }]}>{t('dashboard.monthlyRevenue', locale)}</Text>
              <Text style={[styles.revenueValue, { color: colors.text }]}>
                €{(overview?.monthly_revenue || 0).toLocaleString()}
              </Text>
            </View>
            <View style={[styles.revenueIconBox, { backgroundColor: colors.successLight }]}>
              <Ionicons name="trending-up" size={28} color={colors.success} />
            </View>
          </View>
          <View style={styles.revenueSubRow}>
            <Ionicons name="receipt-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.revenueSubText, { color: colors.textSecondary }]}>
              {overview?.monthly_orders || 0} {t('dashboard.monthlyOrders', locale).toLowerCase()}
            </Text>
          </View>
        </Card>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard.quickActions', locale)}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll}>
          <View style={styles.actionsRow}>
            {[
              { label: t('dashboard.newFreight', locale), icon: 'add-circle' as const, color: colors.primary, route: '/(tabs)/marketplace' },
              { label: t('dashboard.newOrder', locale), icon: 'document-text' as const, color: colors.info, route: '/(tabs)/orders' },
              { label: 'Analytics', icon: 'analytics' as const, color: '#8b5cf6', route: '/(tabs)/analytics' },
              { label: 'Tenders', icon: 'megaphone' as const, color: colors.warning, route: '/(tabs)/tenders' },
              { label: 'Networks', icon: 'people' as const, color: colors.success, route: '/(tabs)/networks' },
              { label: 'Companies', icon: 'business' as const, color: colors.secondary, route: '/(tabs)/companies' },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionBtn}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Recent Orders */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard.recentOrders', locale)}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
            <Text style={[styles.viewAllText, { color: colors.primaryLight }]}>{t('common.viewAll', locale)}</Text>
          </TouchableOpacity>
        </View>

        {data?.recent_orders?.slice(0, 5).map((order: TransportOrder) => (
          <TouchableOpacity
            key={order.id}
            style={[styles.orderItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            onPress={() => router.push(`/(tabs)/orders/${order.id}` as any)}
            activeOpacity={0.7}
          >
            <View style={styles.orderLeft}>
              <Text style={[styles.orderNumber, { color: colors.primary }]}>{order.order_number}</Text>
              <Text style={[styles.orderRoute, { color: colors.textSecondary }]}>
                {order.pickup_city} → {order.delivery_city}
              </Text>
            </View>
            <View style={styles.orderRight}>
              <Badge label={order.status.replace(/_/g, ' ')} status={order.status} />
              <Text style={[styles.orderPrice, { color: colors.text }]}>€{order.total_price.toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {(!data?.recent_orders || data.recent_orders.length === 0) && (
          <Card>
            <View style={styles.emptyOrders}>
              <Ionicons name="document-text-outline" size={40} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('orders.noOrders', locale)}</Text>
            </View>
          </Card>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  greeting: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  companyName: { fontSize: FontSize.sm, marginTop: 2 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', ...Shadow.sm,
  },
  scrollContent: { paddingHorizontal: Spacing.xxl },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.lg },
  revenueCard: { marginBottom: Spacing.xl },
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  revenueLabel: { fontSize: FontSize.sm },
  revenueValue: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, marginTop: Spacing.xs },
  revenueIconBox: {
    width: 48, height: 48, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  revenueSubRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.md },
  revenueSubText: { fontSize: FontSize.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  viewAllText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  actionsScroll: { marginBottom: Spacing.xl },
  actionsRow: { flexDirection: 'row', gap: Spacing.md },
  actionBtn: { alignItems: 'center', width: 80 },
  actionIcon: {
    width: 56, height: 56, borderRadius: BorderRadius.lg,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
  },
  actionLabel: { fontSize: FontSize.xs, textAlign: 'center' },
  orderItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.lg, borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm, borderWidth: 1, ...Shadow.sm,
  },
  orderLeft: {},
  orderNumber: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  orderRoute: { fontSize: FontSize.sm, marginTop: 2 },
  orderRight: { alignItems: 'flex-end', gap: Spacing.xs },
  orderPrice: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  emptyOrders: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: FontSize.md, marginTop: Spacing.md },
});
