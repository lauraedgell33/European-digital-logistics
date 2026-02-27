import React, { useState } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import TabBar from '@/components/ui/TabBar';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { TransportOrder, PaginatedResponse } from '@/types';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Active' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function OrdersScreen() {
  const locale = useAppStore((s) => s.locale);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders', activeTab, search, page],
    queryFn: async () => {
      const params: any = { page, per_page: 20 };
      if (activeTab !== 'all') params.status = activeTab;
      if (search) params.search = search;
      const res = await orderApi.list(params);
      return res.data as PaginatedResponse<TransportOrder>;
    },
  });

  const orders = data?.data || [];

  if (isLoading && !data) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('orders.title', locale)}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(tabs)/orders/create')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.search', locale) + '...'}
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

      {/* Tab Filter */}
      <TabBar tabs={statusTabs} activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setPage(1); }} />

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <OrderCard
            orderNumber={item.order_number}
            status={item.status}
            pickupCity={item.pickup_city}
            pickupCountry={item.pickup_country}
            deliveryCity={item.delivery_city}
            deliveryCountry={item.delivery_country}
            price={item.total_price}
            currency={item.currency}
            pickupDate={item.pickup_date}
            onPress={() => router.push(`/(tabs)/orders/${item.id}` as any)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title={t('orders.noOrders', locale)}
            description="Create your first transport order"
            actionLabel={t('orders.newOrder', locale)}
            onAction={() => router.push('/(tabs)/orders/create')}
          />
        }
        onEndReached={() => {
          if (data && page < data.last_page) setPage(page + 1);
        }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  addBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xxl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
    gap: Spacing.sm, marginBottom: Spacing.md,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text, paddingVertical: Spacing.xs },
  listContent: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md, paddingBottom: Spacing.xxl },
});
