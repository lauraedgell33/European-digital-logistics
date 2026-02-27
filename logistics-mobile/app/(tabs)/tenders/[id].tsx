import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenderApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ListItem from '@/components/ui/ListItem';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { Tender, TenderBid } from '@/types';
import { format } from 'date-fns';

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

export default function TenderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const locale = useAppStore((s) => s.locale);
  const addNotification = useAppStore((s) => s.addNotification);
  const queryClient = useQueryClient();

  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidPrice, setBidPrice] = useState('');
  const [bidTransitTime, setBidTransitTime] = useState('');
  const [bidNotes, setBidNotes] = useState('');
  const [bidErrors, setBidErrors] = useState<Record<string, string>>({});

  const {
    data: tender,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['tender', id],
    queryFn: async () => {
      const res = await tenderApi.get(Number(id));
      return (res.data.data || res.data) as Tender;
    },
    enabled: !!id,
  });

  const submitBidMutation = useMutation({
    mutationFn: (data: { proposed_price: number; transit_time_hours: number; proposal: string }) =>
      tenderApi.submitBid(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tender', id] });
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      addNotification({ type: 'success', title: 'Bid submitted successfully' });
      setBidModalVisible(false);
      resetBidForm();
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Failed to submit bid' });
    },
  });

  const resetBidForm = () => {
    setBidPrice('');
    setBidTransitTime('');
    setBidNotes('');
    setBidErrors({});
  };

  const validateBid = (): boolean => {
    const errors: Record<string, string> = {};
    if (!bidPrice || isNaN(Number(bidPrice)) || Number(bidPrice) <= 0) {
      errors.price = 'Enter a valid price';
    }
    if (!bidTransitTime || isNaN(Number(bidTransitTime)) || Number(bidTransitTime) <= 0) {
      errors.transitTime = 'Enter valid transit time';
    }
    setBidErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBid = () => {
    if (!validateBid()) return;
    submitBidMutation.mutate({
      proposed_price: Number(bidPrice),
      transit_time_hours: Number(bidTransitTime),
      proposal: bidNotes,
    });
  };

  if (isLoading || !tender) return <LoadingScreen />;

  const deadlineText = formatDeadline(tender.submission_deadline);
  const isExpired = deadlineText === 'Expired';
  const canBid = tender.status === 'open' && !isExpired;
  const currencySymbol = tender.currency === 'EUR' ? '€' : tender.currency;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Tender Details
        </Text>
        <Badge label={tender.status} status={tender.status} size="md" />
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
        {/* Overview */}
        <Card title="Overview">
          <Text style={styles.tenderTitle}>{tender.title}</Text>
          {tender.reference_number && (
            <Text style={styles.refNumber}>Ref: #{tender.reference_number}</Text>
          )}
          {tender.description && (
            <Text style={styles.description}>{tender.description}</Text>
          )}
        </Card>

        {/* Route */}
        <Card title="Route" style={styles.marginTop}>
          <View style={styles.routeRow}>
            <View style={styles.routePointCol}>
              <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
              <View style={styles.routeLine} />
              <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
            </View>
            <View style={styles.routeDetails}>
              <View>
                <Text style={styles.routeLabel}>ORIGIN</Text>
                <Text style={styles.routeCity}>
                  {tender.route_origin_city}, {tender.route_origin_country}
                </Text>
              </View>
              <View style={{ marginTop: Spacing.xl }}>
                <Text style={styles.routeLabel}>DESTINATION</Text>
                <Text style={styles.routeCity}>
                  {tender.route_destination_city}, {tender.route_destination_country}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Requirements */}
        <Card title="Requirements" style={styles.marginTop}>
          {tender.cargo_type && (
            <ListItem
              title="Cargo Type"
              value={tender.cargo_type}
              leftIcon="cube-outline"
              borderBottom
            />
          )}
          {tender.vehicle_type && (
            <ListItem
              title="Vehicle Type"
              value={tender.vehicle_type}
              leftIcon="bus-outline"
              borderBottom
            />
          )}
          <ListItem
            title="Frequency"
            value={tender.frequency}
            leftIcon="repeat-outline"
            borderBottom={false}
          />
        </Card>

        {/* Timeline */}
        <Card title="Timeline" style={styles.marginTop}>
          <ListItem
            title="Start Date"
            value={format(new Date(tender.start_date), 'MMM dd, yyyy')}
            leftIcon="calendar-outline"
            leftIconColor={Colors.success}
            leftIconBg={Colors.successLight}
            borderBottom
          />
          <ListItem
            title="End Date"
            value={format(new Date(tender.end_date), 'MMM dd, yyyy')}
            leftIcon="calendar-outline"
            leftIconColor={Colors.danger}
            leftIconBg={Colors.dangerLight}
            borderBottom
          />
          <ListItem
            title="Submission Deadline"
            value={format(new Date(tender.submission_deadline), 'MMM dd, yyyy')}
            leftIcon="time-outline"
            leftIconColor={isExpired ? Colors.danger : Colors.warning}
            leftIconBg={isExpired ? Colors.dangerLight : Colors.warningLight}
            borderBottom={false}
          />
          <View style={styles.deadlineBadge}>
            <Ionicons
              name="hourglass-outline"
              size={14}
              color={isExpired ? Colors.danger : Colors.primaryLight}
            />
            <Text
              style={[
                styles.deadlineText,
                isExpired && { color: Colors.danger },
              ]}
            >
              {deadlineText}
            </Text>
          </View>
        </Card>

        {/* Budget */}
        <Card title="Budget" style={styles.marginTop}>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetValue}>
              {formatBudget(tender.budget, tender.currency)}
            </Text>
            {tender.budget_type && (
              <Badge label={tender.budget_type.replace(/_/g, ' ')} variant="info" size="sm" />
            )}
          </View>
        </Card>

        {/* Company */}
        {tender.company && (
          <Card title="Published By" style={styles.marginTop}>
            <View style={styles.companyRow}>
              <View style={styles.companyIcon}>
                <Ionicons name="business" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.companyName}>{tender.company.name}</Text>
                <Text style={styles.companyCountry}>{tender.company.country}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Bids */}
        {tender.bids && tender.bids.length > 0 && (
          <Card title={`Bids (${tender.bids.length})`} style={styles.marginTop} noPadding>
            {tender.bids.map((bid: TenderBid, index: number) => (
              <View
                key={bid.id}
                style={[
                  styles.bidItem,
                  index < tender.bids!.length - 1 && styles.bidItemBorder,
                ]}
              >
                <View style={styles.bidHeader}>
                  <View style={styles.bidCompany}>
                    <View style={styles.bidCompanyIcon}>
                      <Ionicons name="business-outline" size={16} color={Colors.primary} />
                    </View>
                    <Text style={styles.bidCompanyName} numberOfLines={1}>
                      {bid.company?.name || `Company #${bid.company_id}`}
                    </Text>
                  </View>
                  <Badge label={bid.status} status={bid.status} size="sm" />
                </View>
                <View style={styles.bidDetailsRow}>
                  <View style={styles.bidDetail}>
                    <Ionicons name="cash-outline" size={14} color={Colors.textTertiary} />
                    <Text style={styles.bidDetailText}>
                      {currencySymbol} {bid.proposed_price.toLocaleString()}
                    </Text>
                  </View>
                  {bid.transit_time_hours != null && (
                    <View style={styles.bidDetail}>
                      <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
                      <Text style={styles.bidDetailText}>
                        {bid.transit_time_hours}h transit
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Spacer for bottom button */}
        <View style={{ height: canBid ? 100 : Spacing.xxxl }} />
      </ScrollView>

      {/* Submit Bid Button */}
      {canBid && (
        <View style={styles.bottomBar}>
          <Button
            title="Submit Bid"
            onPress={() => setBidModalVisible(true)}
            icon={<Ionicons name="send" size={18} color={Colors.white} />}
          />
        </View>
      )}

      {/* Bid Modal */}
      <Modal
        visible={bidModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBidModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Bid</Text>
              <TouchableOpacity
                onPress={() => {
                  setBidModalVisible(false);
                  resetBidForm();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBody}
            >
              <Input
                label={`Proposed Price (${currencySymbol})`}
                placeholder="Enter your price"
                value={bidPrice}
                onChangeText={setBidPrice}
                keyboardType="numeric"
                leftIcon="cash-outline"
                error={bidErrors.price}
              />
              <Input
                label="Transit Time (hours)"
                placeholder="e.g. 48"
                value={bidTransitTime}
                onChangeText={setBidTransitTime}
                keyboardType="numeric"
                leftIcon="time-outline"
                error={bidErrors.transitTime}
              />
              <Input
                label="Notes / Proposal"
                placeholder="Describe your offer..."
                value={bidNotes}
                onChangeText={setBidNotes}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                leftIcon="document-text-outline"
              />

              <Button
                title="Submit Bid"
                onPress={handleSubmitBid}
                loading={submitBidMutation.isPending}
                icon={<Ionicons name="send" size={18} color={Colors.white} />}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  backBtn: { marginRight: Spacing.sm },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  scrollContent: { paddingHorizontal: Spacing.xxl },

  // Overview
  tenderTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  refNumber: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: Spacing.sm,
  },

  // Route
  routeRow: { flexDirection: 'row', gap: Spacing.lg },
  routePointCol: { alignItems: 'center', paddingTop: 4 },
  routeDot: { width: 14, height: 14, borderRadius: 7 },
  routeLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  routeDetails: { flex: 1 },
  routeLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeCity: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginTop: 2,
  },

  // Timeline
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  deadlineText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primaryLight,
  },

  // Budget
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetValue: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },

  // Company
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  companyIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  companyCountry: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Bids
  bidItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  bidItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bidCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  bidCompanyIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidCompanyName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    flex: 1,
  },
  bidDetailsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  bidDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bidDetailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // Bottom bar
  marginTop: { marginTop: Spacing.lg },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.md,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  modalBody: {
    padding: Spacing.xxl,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
