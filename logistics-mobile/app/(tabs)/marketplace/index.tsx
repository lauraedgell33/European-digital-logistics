import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { freightApi, vehicleApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import FreightCard from '@/components/FreightCard';
import VehicleCard from '@/components/VehicleCard';
import TabBar from '@/components/ui/TabBar';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { FreightOffer, VehicleOffer } from '@/types';

const TABS = [
  { key: 'freight', label: 'Freight' },
  { key: 'vehicles', label: 'Vehicles' },
];

export default function MarketplaceScreen() {
  const locale = useAppStore((s) => s.locale);
  const [activeTab, setActiveTab] = useState('freight');
  const [search, setSearch] = useState('');

  const freightQuery = useInfiniteQuery({
    queryKey: ['freight', search],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await freightApi.list({ page: pageParam, search });
      return res.data;
    },
    getNextPageParam: (lastPage: any) => {
      if (lastPage.meta?.current_page < lastPage.meta?.last_page) return lastPage.meta.current_page + 1;
      return undefined;
    },
    initialPageParam: 1,
    enabled: activeTab === 'freight',
  });

  const vehicleQuery = useInfiniteQuery({
    queryKey: ['vehicles', search],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await vehicleApi.list({ page: pageParam, search });
      return res.data;
    },
    getNextPageParam: (lastPage: any) => {
      if (lastPage.meta?.current_page < lastPage.meta?.last_page) return lastPage.meta.current_page + 1;
      return undefined;
    },
    initialPageParam: 1,
    enabled: activeTab === 'vehicles',
  });

  const freightItems = freightQuery.data?.pages.flatMap((p: any) => p.data || []) || [];
  const vehicleItems = vehicleQuery.data?.pages.flatMap((p: any) => p.data || []) || [];

  const isLoading = activeTab === 'freight' ? freightQuery.isLoading : vehicleQuery.isLoading;
  const isFetchingNext = activeTab === 'freight' ? freightQuery.isFetchingNextPage : vehicleQuery.isFetchingNextPage;
  const isRefetching = activeTab === 'freight' ? freightQuery.isRefetching : vehicleQuery.isRefetching;
  const hasNextPage = activeTab === 'freight' ? freightQuery.hasNextPage : vehicleQuery.hasNextPage;

  const onRefresh = () => {
    if (activeTab === 'freight') freightQuery.refetch();
    else vehicleQuery.refetch();
  };

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNext) {
      if (activeTab === 'freight') freightQuery.fetchNextPage();
      else vehicleQuery.fetchNextPage();
    }
  };

  const renderEmpty = () => (
    <EmptyState
      icon={activeTab === 'freight' ? 'cube-outline' : 'bus-outline'}
      title={activeTab === 'freight' ? t('freight.noOffers', locale) : t('vehicles.noOffers', locale)}
      description={activeTab === 'freight' ? t('freight.noOffersDesc', locale) : t('vehicles.noOffersDesc', locale)}
      actionTitle={t('common.create', locale)}
      onAction={() => router.push(`/(tabs)/marketplace/create-${activeTab === 'freight' ? 'freight' : 'vehicle'}` as any)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('nav.marketplace', locale)}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push(`/(tabs)/marketplace/create-${activeTab === 'freight' ? 'freight' : 'vehicle'}` as any)}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <TabBar
        tabs={TABS.map(tab => ({ key: tab.key, label: tab.label }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search', locale)}
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <FlatList
          data={activeTab === 'freight' ? freightItems : vehicleItems}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }) =>
            activeTab === 'freight' ? (
              <FreightCard freight={item as FreightOffer} onPress={() => router.push(`/(tabs)/marketplace/freight/${item.id}` as any)} />
            ) : (
              <VehicleCard vehicle={item as VehicleOffer} onPress={() => router.push(`/(tabs)/marketplace/vehicle/${item.id}` as any)} />
            )
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmpty}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={Colors.primary} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.text },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { paddingHorizontal: Spacing.xxl, marginBottom: Spacing.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  list: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl },
});
