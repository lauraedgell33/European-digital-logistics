import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ListItem from '@/components/ui/ListItem';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { TransportOrder } from '@/types';
import { format } from 'date-fns';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const locale = useAppStore((s) => s.locale);
  const addNotification = useAppStore((s) => s.addNotification);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: order, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await orderApi.get(Number(id));
      return (res.data.data || res.data) as TransportOrder;
    },
    enabled: !!id,
  });

  const acceptMutation = useMutation({
    mutationFn: () => orderApi.accept(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addNotification({ type: 'success', title: 'Order Accepted' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => orderApi.reject(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addNotification({ type: 'info', title: 'Order Rejected' });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => orderApi.cancel(Number(id), reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addNotification({ type: 'warning', title: 'Order Cancelled' });
    },
  });

  const handleCancel = () => {
    Alert.alert(
      t('orders.cancel', locale),
      t('orders.cancelReason', locale),
      [
        { text: t('common.no', locale), style: 'cancel' },
        { text: t('common.yes', locale), style: 'destructive', onPress: () => cancelMutation.mutate('Cancelled by user') },
      ]
    );
  };

  if (isLoading || !order) return <LoadingScreen />;

  const isCarrier = user?.company_id === order.carrier_id;
  const canAccept = isCarrier && order.status === 'pending';
  const canCancel = ['pending', 'accepted', 'pickup_scheduled'].includes(order.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{order.order_number}</Text>
        <Badge label={order.status.replace(/_/g, ' ')} status={order.status} size="md" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Route Card */}
        <Card style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.routePointCol}>
              <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
              <View style={styles.routeLine} />
              <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
            </View>
            <View style={styles.routeDetails}>
              <View style={styles.routePoint}>
                <Text style={styles.routeLabel}>{t('orders.pickup', locale)}</Text>
                <Text style={styles.routeCity}>{order.pickup_city}, {order.pickup_country}</Text>
                <Text style={styles.routeAddress}>{order.pickup_address}</Text>
                <Text style={styles.routeDate}>{format(new Date(order.pickup_date), 'MMM dd, yyyy')}</Text>
              </View>
              <View style={[styles.routePoint, { marginTop: Spacing.xl }]}>
                <Text style={styles.routeLabel}>{t('orders.delivery', locale)}</Text>
                <Text style={styles.routeCity}>{order.delivery_city}, {order.delivery_country}</Text>
                <Text style={styles.routeAddress}>{order.delivery_address}</Text>
                <Text style={styles.routeDate}>{format(new Date(order.delivery_date), 'MMM dd, yyyy')}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Price & Payment */}
        <Card title={t('orders.price', locale)}>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>€{order.total_price.toLocaleString()}</Text>
            <Badge label={order.payment_status} status={order.payment_status} />
          </View>
          <Text style={styles.paymentTerms}>{order.payment_terms}</Text>
        </Card>

        {/* Cargo Details */}
        <Card title={t('orders.cargo', locale)} style={styles.marginTop}>
          <ListItem title={t('orders.weight', locale)} value={`${order.weight.toLocaleString()} kg`} leftIcon="scale-outline" borderBottom />
          {order.volume && <ListItem title={t('orders.volume', locale)} value={`${order.volume} m³`} leftIcon="cube-outline" borderBottom />}
          {order.pallet_count && <ListItem title={t('orders.pallets', locale)} value={`${order.pallet_count}`} leftIcon="grid-outline" borderBottom />}
          <ListItem title="Cargo Type" value={order.cargo_type} leftIcon="archive-outline" borderBottom={false} />
        </Card>

        {/* Companies */}
        <Card title={t('orders.shipper', locale)} style={styles.marginTop}>
          <View style={styles.companyRow}>
            <View style={styles.companyIcon}>
              <Ionicons name="business" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.companyName}>{order.shipper?.name || 'N/A'}</Text>
              <Text style={styles.companyCountry}>{order.shipper?.country}</Text>
            </View>
          </View>
        </Card>

        <Card title={t('orders.carrier', locale)} style={styles.marginTop}>
          <View style={styles.companyRow}>
            <View style={[styles.companyIcon, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="bus" size={20} color={Colors.info} />
            </View>
            <View>
              <Text style={styles.companyName}>{order.carrier?.name || 'N/A'}</Text>
              <Text style={styles.companyCountry}>{order.carrier?.country}</Text>
            </View>
          </View>
        </Card>

        {/* Special Instructions */}
        {order.special_instructions && (
          <Card title={t('orders.specialInstructions', locale)} style={styles.marginTop}>
            <Text style={styles.instructionsText}>{order.special_instructions}</Text>
          </Card>
        )}

        {/* Actions */}
        {(canAccept || canCancel) && (
          <View style={styles.actions}>
            {canAccept && (
              <View style={styles.actionRow}>
                <Button
                  title={t('orders.accept', locale)}
                  onPress={() => acceptMutation.mutate()}
                  loading={acceptMutation.isPending}
                  icon={<Ionicons name="checkmark" size={18} color={Colors.white} />}
                  style={{ flex: 1 }}
                />
                <Button
                  title={t('orders.reject', locale)}
                  onPress={() => rejectMutation.mutate()}
                  loading={rejectMutation.isPending}
                  variant="danger"
                  icon={<Ionicons name="close" size={18} color={Colors.white} />}
                  style={{ flex: 1 }}
                />
              </View>
            )}
            {canCancel && !canAccept && (
              <Button
                title={t('orders.cancel', locale)}
                onPress={handleCancel}
                variant="outline"
                loading={cancelMutation.isPending}
                icon={<Ionicons name="close-circle-outline" size={18} color={Colors.primary} />}
              />
            )}
          </View>
        )}

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg, gap: Spacing.md,
  },
  backBtn: { marginRight: Spacing.sm },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.xxl },
  routeCard: { marginBottom: Spacing.lg },
  routeRow: { flexDirection: 'row', gap: Spacing.lg },
  routePointCol: { alignItems: 'center', paddingTop: 4 },
  routeDot: { width: 14, height: 14, borderRadius: 7 },
  routeLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: Spacing.xs },
  routeDetails: { flex: 1 },
  routePoint: {},
  routeLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  routeCity: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text, marginTop: 2 },
  routeAddress: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  routeDate: { fontSize: FontSize.sm, color: Colors.primaryLight, marginTop: Spacing.xs },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceValue: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.primary },
  paymentTerms: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  marginTop: { marginTop: Spacing.lg },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  companyIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: Colors.primaryBg,
    justifyContent: 'center', alignItems: 'center',
  },
  companyName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  companyCountry: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  instructionsText: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },
  actions: { marginTop: Spacing.xxl },
  actionRow: { flexDirection: 'row', gap: Spacing.md },
});
