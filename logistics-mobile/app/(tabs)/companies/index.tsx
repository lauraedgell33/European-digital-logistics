import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { companyApi } from '@/lib/api';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { Company } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';

// ── Constants ─────────────────────────────────────────
const COMPANY_TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'carrier', label: 'Carrier' },
  { key: 'shipper', label: 'Shipper' },
  { key: 'freight_forwarder', label: 'Freight Forwarder' },
  { key: 'broker', label: 'Broker' },
  { key: 'logistics_provider', label: 'Logistics Provider' },
] as const;

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  carrier: { bg: '#dbeafe', text: '#1e40af' },
  freight_forwarder: { bg: '#ede9fe', text: '#5b21b6' },
  shipper: { bg: '#d1fae5', text: '#065f46' },
  broker: { bg: '#ffedd5', text: '#9a3412' },
  logistics_provider: { bg: '#cffafe', text: '#155e75' },
};

// ── Helpers ───────────────────────────────────────────
const getCountryFlag = (country: string): string => {
  const code = country.toUpperCase().trim();
  if (code.length === 2) {
    return String.fromCodePoint(
      ...code.split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
  }
  return '🌍';
};

const formatType = (type: string): string =>
  type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const renderStars = (rating: number): string => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
};

// ── Company Card ──────────────────────────────────────
function CompanyCard({ company, onPress }: { company: Company; onPress: () => void }) {
  const typeColor = TYPE_COLORS[company.type] || { bg: Colors.surfaceSecondary, text: Colors.textSecondary };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      {/* Top row: avatar + name + verified */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          {company.logo_url ? (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{company.name.charAt(0).toUpperCase()}</Text>
            </View>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{company.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardTitleWrap}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {company.name}
            </Text>
            {company.is_verified && (
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} style={{ marginLeft: 4 }} />
            )}
          </View>
          {/* Type badge */}
          <View style={[styles.typeBadge, { backgroundColor: typeColor.bg }]}>
            <Text style={[styles.typeBadgeText, { color: typeColor.text }]}>{formatType(company.type)}</Text>
          </View>
        </View>
      </View>

      {/* Location */}
      {(company.country || company.city) && (
        <View style={styles.locationRow}>
          <Text style={styles.locationText}>
            {getCountryFlag(company.country)} {company.city ? `${company.city}, ` : ''}
            {company.country}
          </Text>
        </View>
      )}

      {/* Description */}
      {company.description && (
        <Text style={styles.description} numberOfLines={2}>
          {company.description}
        </Text>
      )}

      {/* Footer: rating */}
      {(company.rating != null && company.rating > 0) && (
        <View style={styles.ratingRow}>
          <Text style={styles.stars}>{renderStars(company.rating)}</Text>
          <Text style={styles.ratingValue}>{company.rating.toFixed(1)}</Text>
          {company.total_reviews != null && (
            <Text style={styles.reviews}>({company.total_reviews})</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────
export default function CompaniesScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['companies', search, activeFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, any> = { page: pageParam, search };
      if (activeFilter !== 'all') params.type = activeFilter;
      const res = await companyApi.list(params);
      return res.data;
    },
    getNextPageParam: (lastPage: any) => {
      if (lastPage.meta?.current_page < lastPage.meta?.last_page) {
        return lastPage.meta.current_page + 1;
      }
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const companies: Company[] = useMemo(
    () => data?.pages.flatMap((p: any) => p.data || []) || [],
    [data]
  );

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Company }) => (
      <CompanyCard
        company={item}
        onPress={() => router.push(`/(tabs)/companies/${item.id}` as any)}
      />
    ),
    []
  );

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        icon="business-outline"
        title="No companies found"
        description={search ? 'Try adjusting your search or filters' : 'No companies are available yet'}
      />
    ),
    [search]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }, [isFetchingNextPage]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Companies</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={COMPANY_TYPE_FILTERS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        renderItem={({ item }) => {
          const isActive = activeFilter === item.key;
          return (
            <TouchableOpacity
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              activeOpacity={0.7}
              onPress={() => setActiveFilter(item.key)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* List */}
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },

  // Search
  searchContainer: {
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },

  // List
  list: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  footerLoader: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    marginRight: Spacing.md,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  cardTitleWrap: {
    flex: 1,
    gap: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    flexShrink: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  locationText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stars: {
    fontSize: FontSize.sm,
    color: Colors.warning,
  },
  ratingValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  reviews: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
});
