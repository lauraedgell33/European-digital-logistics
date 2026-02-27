import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { tenderApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import TabBar from '@/components/ui/TabBar';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { Tender, PaginatedResponse } from '@/types';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'evaluation', label: 'Evaluation' },
  { key: 'awarded', label: 'Awarded' },
];

function formatDeadline(deadline: string): string {
  const daysLeft = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return daysLeft > 0 ? `${daysLeft} days left` : 'Expired';
}

function formatBudget(budget: number | undefined, currency: string): string {
  if (!budget) return 'Negotiable';
  return `${currency === 'EUR' ? '€' : currency} ${budget.toLocaleString()}`;
}

export default function TendersScreen() {
  const locale = useAppStore((s) => s.locale);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['tenders', activeTab, search],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, any> = { page: pageParam, per_page: 20 };
      if (activeTab !== 'all') params.status = activeTab;
      if (search) params.search = search;
      const res = await tenderApi.list(params);
      return res.data as PaginatedResponse<Tender>;
    },
    getNextPageParam: (lastPage: PaginatedResponse<Tender>) => {
      if (lastPage.current_page < lastPage.last_page) return lastPage.current_page + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const tenders = data?.pages.flatMap((page) => page.data) || [];

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const renderTenderCard = useCallback(
    ({ item }: { item: Tender }) => {
      const deadlineText = formatDeadline(item.submission_deadline);
      const isExpired = deadlineText === 'Expired';

      return (
        <Card
          style={styles.tenderCard}
          onPress={() => router.push(`/(tabs)/tenders/${item.id}` as any)}
        >
          {/* Header row */}
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.reference_number && (
                <Text style={styles.cardRef}>#{item.reference_number}</Text>
              )}
            </View>
            <Badge label={item.status} status={item.status} size="sm" />
          </View>

          {/* Route */}
          <View style={styles.routeRow}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.routeCity} numberOfLines={1}>
                {item.route_origin_city}
              </Text>
              <Text style={styles.routeCountry}>{item.route_origin_country}</Text>
            </View>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={Colors.textTertiary}
              style={styles.routeArrow}
            />
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
              <Text style={styles.routeCity} numberOfLines={1}>
                {item.route_destination_city}
              </Text>
              <Text style={styles.routeCountry}>{item.route_destination_country}</Text>
            </View>
          </View>

          {/* Details row */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.detailText}>
                {formatBudget(item.budget, item.currency)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={isExpired ? Colors.danger : Colors.textTertiary}
              />
              <Text
                style={[
                  styles.detailText,
                  isExpired && { color: Colors.danger },
                ]}
              >
                {deadlineText}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="document-text-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.detailText}>
                {item.bids_count ?? 0} bids
              </Text>
            </View>
          </View>
        </Card>
      );
    },
    []
  );

  if (isLoading && !data) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('tenders.title', locale) || 'Tenders'}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder={`${t('common.search', locale) || 'Search'}...`}
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Status filter */}
      <TabBar tabs={statusTabs} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tender list */}
      <FlatList
        data={tenders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTenderCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="megaphone-outline"
            title="No tenders found"
            description="There are no tenders matching your criteria."
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  tenderCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cardTitleWrap: { flex: 1 },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  cardRef: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeCity: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    flexShrink: 1,
  },
  routeCountry: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  routeArrow: {
    marginHorizontal: Spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
