import React, { useState, useCallback, useMemo } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { AnalyticsData, TopRoute, MonthlyOrderData } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.xxl * 2 - Spacing.md) / 2;

type Period = 'this_month' | 'last_month' | 'this_year';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'this_year', label: 'This Year' },
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${(value / 1_000).toFixed(1)}K`;
  return `€${value.toFixed(0)}`;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// ── Revenue Section ───────────────────────────────────
function RevenueSection({ revenue }: { revenue: AnalyticsData['revenue'] }) {
  const isPositiveGrowth = revenue.growth >= 0;
  const growthColor = isPositiveGrowth ? Colors.success : Colors.danger;
  const growthBg = isPositiveGrowth ? Colors.successLight : Colors.dangerLight;
  const growthIcon = isPositiveGrowth ? 'trending-up' : 'trending-down';

  return (
    <Card style={styles.revenueCard}>
      <View style={styles.revenueHeader}>
        <View style={styles.revenueIconWrap}>
          <Ionicons name="wallet" size={24} color={Colors.primary} />
        </View>
        <View style={[styles.growthBadge, { backgroundColor: growthBg }]}>
          <Ionicons name={growthIcon} size={14} color={growthColor} />
          <Text style={[styles.growthText, { color: growthColor }]}>
            {formatPercent(revenue.growth)}
          </Text>
        </View>
      </View>
      <Text style={styles.revenueLabel}>Total Revenue</Text>
      <Text style={styles.revenueValue}>{formatCurrency(revenue.total)}</Text>
      <View style={styles.revenueDivider} />
      <View style={styles.revenueFooter}>
        <View style={styles.revenueSubStat}>
          <Text style={styles.revenueSubLabel}>Monthly</Text>
          <Text style={styles.revenueSubValue}>{formatCurrency(revenue.monthly)}</Text>
        </View>
        <View style={styles.revenueSubDivider} />
        <View style={styles.revenueSubStat}>
          <Text style={styles.revenueSubLabel}>Growth</Text>
          <Text style={[styles.revenueSubValue, { color: growthColor }]}>
            {formatPercent(revenue.growth)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

// ── Top Routes Section ────────────────────────────────
function TopRoutesSection({ routes }: { routes: TopRoute[] }) {
  const maxRevenue = useMemo(
    () => Math.max(...routes.map((r) => r.revenue), 1),
    [routes],
  );

  if (!routes.length) {
    return (
      <Card title="Top Routes">
        <Text style={styles.emptyText}>No route data available</Text>
      </Card>
    );
  }

  return (
    <Card title="Top Routes">
      {routes.map((route, index) => {
        const barWidth = (route.revenue / maxRevenue) * 100;
        return (
          <View key={`${route.origin}-${route.destination}-${index}`} style={styles.routeRow}>
            <View style={styles.routeInfo}>
              <View style={styles.routeIndex}>
                <Text style={styles.routeIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.routeDetails}>
                <View style={styles.routeNameRow}>
                  <Text style={styles.routeOrigin} numberOfLines={1}>
                    {route.origin}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={12}
                    color={Colors.textTertiary}
                    style={styles.routeArrow}
                  />
                  <Text style={styles.routeDestination} numberOfLines={1}>
                    {route.destination}
                  </Text>
                </View>
                <View style={styles.routeMeta}>
                  <Text style={styles.routeCount}>{route.count} shipments</Text>
                  <Text style={styles.routeRevenue}>{formatCurrency(route.revenue)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.routeBarBg}>
              <View
                style={[
                  styles.routeBarFill,
                  { width: `${barWidth}%` },
                ]}
              />
            </View>
          </View>
        );
      })}
    </Card>
  );
}

// ── Monthly Trend Section ─────────────────────────────
function MonthlyTrendSection({ data }: { data: MonthlyOrderData[] }) {
  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);
  const maxRevenue = useMemo(() => Math.max(...data.map((d) => d.revenue), 1), [data]);
  const BAR_MAX_HEIGHT = 120;

  if (!data.length) {
    return (
      <Card title="Monthly Trend">
        <Text style={styles.emptyText}>No trend data available</Text>
      </Card>
    );
  }

  const displayData = data.slice(-8);

  return (
    <Card title="Monthly Trend" subtitle="Orders & Revenue">
      {/* Legend */}
      <View style={styles.trendLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendLabel}>Orders</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendLabel}>Revenue</Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {displayData.map((item, index) => {
            const orderHeight = Math.max((item.count / maxCount) * BAR_MAX_HEIGHT, 4);
            const revenueHeight = Math.max((item.revenue / maxRevenue) * BAR_MAX_HEIGHT, 4);
            const monthLabel = item.month.length >= 7
              ? item.month.substring(5, 7)
              : item.month.substring(0, 3);

            return (
              <View key={`${item.month}-${index}`} style={styles.chartBarGroup}>
                <View style={styles.chartBarPair}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: orderHeight,
                        backgroundColor: Colors.primary,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: revenueHeight,
                        backgroundColor: Colors.success,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{monthLabel}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Summary row */}
      <View style={styles.trendSummary}>
        <View style={styles.trendSummaryItem}>
          <Text style={styles.trendSummaryValue}>
            {formatNumber(displayData.reduce((sum, d) => sum + d.count, 0))}
          </Text>
          <Text style={styles.trendSummaryLabel}>Total Orders</Text>
        </View>
        <View style={styles.trendSummarySep} />
        <View style={styles.trendSummaryItem}>
          <Text style={styles.trendSummaryValue}>
            {formatCurrency(displayData.reduce((sum, d) => sum + d.revenue, 0))}
          </Text>
          <Text style={styles.trendSummaryLabel}>Total Revenue</Text>
        </View>
      </View>
    </Card>
  );
}

// ── Main Screen ───────────────────────────────────────
export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<Period>('this_month');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['analytics', period],
    queryFn: async () => {
      const res = await dashboardApi.analytics(period);
      return res.data as AnalyticsData;
    },
  });

  const handlePeriodChange = useCallback((p: Period) => {
    setPeriod(p);
  }, []);

  if (isLoading) return <LoadingScreen />;

  const analytics = data;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.headerIcon}>
          <Ionicons name="analytics" size={24} color={Colors.primary} />
        </View>
      </View>

      {/* Period Selector */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            onPress={() => handlePeriodChange(p.key)}
            style={[
              styles.periodBtn,
              period === p.key && styles.periodBtnActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.periodBtnText,
                period === p.key && styles.periodBtnTextActive,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {analytics ? (
          <>
            {/* Revenue */}
            <RevenueSection revenue={analytics.revenue} />

            {/* Orders Overview */}
            <Text style={styles.sectionTitle}>Orders Overview</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Orders"
                value={formatNumber(analytics.orders.total)}
                icon="documents"
                color={Colors.primary}
                bgColor={Colors.primaryBg}
                style={{ width: CARD_WIDTH }}
              />
              <StatCard
                title="Completed"
                value={formatNumber(analytics.orders.completed)}
                icon="checkmark-circle"
                color={Colors.success}
                bgColor={Colors.successLight}
                style={{ width: CARD_WIDTH }}
              />
              <StatCard
                title="In Transit"
                value={formatNumber(analytics.orders.in_transit)}
                icon="navigate"
                color={Colors.info}
                bgColor={Colors.infoLight}
                style={{ width: CARD_WIDTH }}
              />
              <StatCard
                title="Cancelled"
                value={formatNumber(analytics.orders.cancelled)}
                icon="close-circle"
                color={Colors.danger}
                bgColor={Colors.dangerLight}
                style={{ width: CARD_WIDTH }}
              />
            </View>

            {/* Completion Rate */}
            <Card style={styles.completionCard}>
              <View style={styles.completionRow}>
                <View>
                  <Text style={styles.completionLabel}>Completion Rate</Text>
                  <Text style={styles.completionValue}>
                    {analytics.orders.completion_rate.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.completionBarWrap}>
                  <View style={styles.completionBarBg}>
                    <View
                      style={[
                        styles.completionBarFill,
                        { width: `${Math.min(analytics.orders.completion_rate, 100)}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </Card>

            {/* Freight & Vehicles */}
            <Text style={styles.sectionTitle}>Freight & Vehicles</Text>
            <View style={styles.statsGrid}>
              <Card style={{ width: CARD_WIDTH }}>
                <View style={styles.fvIconRow}>
                  <View style={[styles.fvIconWrap, { backgroundColor: Colors.infoLight }]}>
                    <Ionicons name="cube" size={20} color={Colors.info} />
                  </View>
                </View>
                <Text style={styles.fvTitle}>Freight</Text>
                <Text style={styles.fvValue}>
                  {analytics.freight.active}
                  <Text style={styles.fvTotal}> / {analytics.freight.total_offers}</Text>
                </Text>
                <View style={styles.fvRateRow}>
                  <Ionicons name="git-compare" size={12} color={Colors.textTertiary} />
                  <Text style={styles.fvRate}>
                    {analytics.freight.match_rate.toFixed(0)}% match
                  </Text>
                </View>
                <Text style={styles.fvSub}>
                  {analytics.freight.matched} matched
                </Text>
              </Card>

              <Card style={{ width: CARD_WIDTH }}>
                <View style={styles.fvIconRow}>
                  <View style={[styles.fvIconWrap, { backgroundColor: '#ede9fe' }]}>
                    <Ionicons name="bus" size={20} color={Colors.secondary} />
                  </View>
                </View>
                <Text style={styles.fvTitle}>Vehicles</Text>
                <Text style={styles.fvValue}>
                  {analytics.vehicles.active}
                  <Text style={styles.fvTotal}> / {analytics.vehicles.total_offers}</Text>
                </Text>
                <View style={styles.fvRateRow}>
                  <Ionicons name="speedometer" size={12} color={Colors.textTertiary} />
                  <Text style={styles.fvRate}>
                    {analytics.vehicles.utilization_rate.toFixed(0)}% utilization
                  </Text>
                </View>
              </Card>
            </View>

            {/* Top Routes */}
            <TopRoutesSection routes={analytics.top_routes} />

            {/* Monthly Trend */}
            <MonthlyTrendSection data={analytics.monthly_orders} />

            <View style={styles.bottomSpacer} />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="analytics-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Analytics Data</Text>
            <Text style={styles.emptySubtitle}>
              Data will appear once you start using the platform
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Period selector
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  periodBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
  },
  periodBtnActive: {
    backgroundColor: Colors.primary,
  },
  periodBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  periodBtnTextActive: {
    color: Colors.white,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxxl,
  },

  // Section title
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },

  // Revenue card
  revenueCard: {
    marginBottom: Spacing.sm,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  revenueIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  growthText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  revenueLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  revenueValue: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  revenueDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  revenueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  revenueSubStat: {
    flex: 1,
  },
  revenueSubDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },
  revenueSubLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  revenueSubValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },

  // Completion
  completionCard: {
    marginTop: Spacing.md,
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completionLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  completionValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  completionBarWrap: {
    flex: 1,
    marginLeft: Spacing.xxl,
  },
  completionBarBg: {
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    overflow: 'hidden',
  },
  completionBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success,
  },

  // Freight & Vehicles cards
  fvIconRow: {
    marginBottom: Spacing.md,
  },
  fvIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fvTitle: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  fvValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  fvTotal: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.textTertiary,
  },
  fvRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fvRate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  fvSub: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 4,
  },

  // Top Routes
  routeRow: {
    marginBottom: Spacing.lg,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  routeIndex: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  routeIndexText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  routeDetails: {
    flex: 1,
  },
  routeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeOrigin: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    maxWidth: '35%',
  },
  routeArrow: {
    marginHorizontal: Spacing.xs,
  },
  routeDestination: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    maxWidth: '35%',
  },
  routeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  routeCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  routeRevenue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.success,
  },
  routeBarBg: {
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    overflow: 'hidden',
  },
  routeBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },

  // Monthly Trend
  trendLegend: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
  },
  legendLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  chartContainer: {
    marginBottom: Spacing.lg,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 136,
    paddingTop: Spacing.lg,
  },
  chartBarGroup: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  chartBar: {
    width: 12,
    borderRadius: BorderRadius.sm,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  trendSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  trendSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  trendSummarySep: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  trendSummaryValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  trendSummaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },

  // Empty & Spacer
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: Spacing.xxl,
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
});
