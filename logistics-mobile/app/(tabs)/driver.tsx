import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, trackingApi } from '@/lib/api';
import { useDriverStore, DeliveryTask } from '@/stores/driverStore';
import { useAppStore } from '@/stores/appStore';
import DeliveryCard from '@/components/DeliveryCard';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed'>('today');
  const queryClient = useQueryClient();

  const {
    tasks,
    setTasks,
    currentTask,
    setCurrentTask,
    updateTaskStatus,
    isOnline,
    setOnlineStatus,
    setLocation,
    offlineQueue,
    hydrate,
  } = useDriverStore();

  // Hydrate offline store on mount
  useEffect(() => {
    hydrate();
  }, []);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnlineStatus(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  // Track driver location
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 100,
          timeInterval: 30000,
        },
        (loc) => {
          setLocation(loc.coords.latitude, loc.coords.longitude);
        }
      );
    })();

    return () => subscription?.remove();
  }, []);

  // Fetch delivery tasks from orders
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['driver-tasks'],
    queryFn: async () => {
      const res = await orderApi.list({ status: 'accepted,pickup_scheduled,picked_up,in_transit', per_page: 50 });
      const orders = res.data.data || res.data;
      // Transform orders to delivery tasks
      const deliveryTasks: DeliveryTask[] = [];
      for (const order of orders) {
        if (['accepted', 'pickup_scheduled'].includes(order.status)) {
          deliveryTasks.push({
            id: order.id * 10 + 1,
            order_id: order.id,
            order_number: order.order_number,
            type: 'pickup',
            status: order.status === 'pickup_scheduled' ? 'en_route' : 'pending',
            company_name: order.shipper?.name || 'Shipper',
            contact_name: order.pickup_contact_name,
            contact_phone: order.pickup_contact_phone,
            address: order.pickup_address,
            city: order.pickup_city,
            country: order.pickup_country,
            postal_code: order.pickup_postal_code,
            scheduled_date: order.pickup_date,
            cargo_description: order.cargo_description,
            weight: order.weight,
            pallet_count: order.pallet_count,
          });
        }
        if (['picked_up', 'in_transit'].includes(order.status)) {
          deliveryTasks.push({
            id: order.id * 10 + 2,
            order_id: order.id,
            order_number: order.order_number,
            type: 'delivery',
            status: order.status === 'in_transit' ? 'en_route' : 'pending',
            company_name: order.carrier?.name || 'Receiver',
            contact_name: order.delivery_contact_name,
            contact_phone: order.delivery_contact_phone,
            address: order.delivery_address,
            city: order.delivery_city,
            country: order.delivery_country,
            postal_code: order.delivery_postal_code,
            scheduled_date: order.delivery_date,
            cargo_description: order.cargo_description,
            weight: order.weight,
            pallet_count: order.pallet_count,
          });
        }
      }
      setTasks(deliveryTasks);
      return deliveryTasks;
    },
    enabled: isOnline,
  });

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.scheduled_date === today && t.status !== 'completed');
  const upcomingTasks = tasks.filter((t) => t.scheduled_date > today && t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const displayTasks =
    activeTab === 'today' ? todayTasks :
    activeTab === 'upcoming' ? upcomingTasks :
    completedTasks;

  const handleNavigate = useCallback((task: DeliveryTask) => {
    if (task.lat && task.lng) {
      const url = Platform.select({
        ios: `maps:0,0?q=${task.lat},${task.lng}`,
        android: `geo:${task.lat},${task.lng}?q=${task.lat},${task.lng}(${task.address})`,
      });
      if (url) Linking.openURL(url);
    } else {
      const addr = encodeURIComponent(`${task.address}, ${task.city}, ${task.country}`);
      const url = Platform.select({
        ios: `maps:0,0?q=${addr}`,
        android: `geo:0,0?q=${addr}`,
      });
      if (url) Linking.openURL(url);
    }
  }, []);

  const handleCall = useCallback((task: DeliveryTask) => {
    if (task.contact_phone) {
      Linking.openURL(`tel:${task.contact_phone}`);
    }
  }, []);

  const handleTaskPress = useCallback((task: DeliveryTask) => {
    if (task.status === 'completed') return;
    setCurrentTask(task);
    // Navigate to POD/delivery screen
    router.push(`/pod/${task.order_id}?taskId=${task.id}&type=${task.type}` as any);
  }, []);

  const pendingSync = offlineQueue.filter((a) => !a.synced).length;

  if (isLoading && tasks.length === 0) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Driver Dashboard</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? Colors.success : Colors.danger }]} />
            <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
            {pendingSync > 0 && (
              <Badge label={`${pendingSync} pending sync`} variant="warning" />
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => router.push('/(tabs)/documents' as any)}
        >
          <Ionicons name="scan" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{todayTasks.length}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{upcomingTasks.length}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedTasks.length}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabs}>
        {(['today', 'upcoming', 'completed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {displayTasks.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name={activeTab === 'completed' ? 'checkmark-done-circle' : 'calendar-outline'}
              size={48}
              color={Colors.textTertiary}
            />
            <Text style={styles.emptyText}>
              {activeTab === 'today'
                ? 'No deliveries scheduled for today'
                : activeTab === 'upcoming'
                ? 'No upcoming deliveries'
                : 'No completed deliveries yet'}
            </Text>
          </View>
        ) : (
          displayTasks.map((task) => (
            <DeliveryCard
              key={task.id}
              task={task}
              onPress={() => handleTaskPress(task)}
              onNavigate={() => handleNavigate(task)}
              onCall={() => handleCall(task)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  scanBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    ...Shadow.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.borderLight,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
