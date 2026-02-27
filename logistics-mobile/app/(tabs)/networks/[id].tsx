import React, { useState, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { networkApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { PartnerNetwork, Company } from '@/types';
import { format } from 'date-fns';

// ── Network type color mapping ────────────────────────
const NETWORK_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  consortium: { bg: Colors.primaryBg, text: Colors.primary, dot: Colors.primaryLight },
  alliance: { bg: Colors.infoLight, text: Colors.infoDark, dot: Colors.info },
  marketplace: { bg: Colors.warningLight, text: Colors.warningDark, dot: Colors.warning },
  cooperative: { bg: Colors.successLight, text: Colors.successDark, dot: Colors.success },
};

export default function NetworkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const addNotification = useAppStore((s) => s.addNotification);
  const queryClient = useQueryClient();

  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');

  // ── Fetch network detail ──────────────────────────────
  const {
    data: network,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['network', id],
    queryFn: async () => {
      const res = await networkApi.get(Number(id));
      return (res.data.data || res.data) as PartnerNetwork;
    },
    enabled: !!id,
  });

  // ── Join mutation ─────────────────────────────────────
  const joinMutation = useMutation({
    mutationFn: (code: string) => networkApi.join(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network', id] });
      queryClient.invalidateQueries({ queryKey: ['networks'] });
      addNotification({ type: 'success', title: 'Successfully joined network' });
      setJoinModalVisible(false);
      setAccessCode('');
      setAccessCodeError('');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Invalid access code or unable to join';
      setAccessCodeError(message);
    },
  });

  // ── Leave mutation ────────────────────────────────────
  const leaveMutation = useMutation({
    mutationFn: () => networkApi.leave(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network', id] });
      queryClient.invalidateQueries({ queryKey: ['networks'] });
      addNotification({ type: 'success', title: 'You have left the network' });
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Failed to leave network' });
    },
  });

  // ── Handlers ──────────────────────────────────────────
  const handleJoin = useCallback(() => {
    const code = accessCode.trim();
    if (!code) {
      setAccessCodeError('Please enter an access code');
      return;
    }
    setAccessCodeError('');
    joinMutation.mutate(code);
  }, [accessCode, joinMutation]);

  const handleLeave = useCallback(() => {
    Alert.alert(
      'Leave Network',
      `Are you sure you want to leave "${network?.name}"? You will need an access code to rejoin.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => leaveMutation.mutate(),
        },
      ],
    );
  }, [network, leaveMutation]);

  // ── Helpers ───────────────────────────────────────────
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const typeColor =
    NETWORK_TYPE_COLORS[network?.type || 'consortium'] || NETWORK_TYPE_COLORS.consortium;

  // ── Loading / Error ───────────────────────────────────
  if (isLoading) return <LoadingScreen />;

  if (!network) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.errorText}>Network not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            size="sm"
            fullWidth={false}
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Network Details
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Network info card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="globe-outline" size={28} color={Colors.primary} />
            </View>
            <View style={styles.infoHeaderText}>
              <Text style={styles.networkName}>{network.name}</Text>
              <View style={styles.infoTypeBadgeRow}>
                <View style={[styles.typeBadge, { backgroundColor: typeColor.bg }]}>
                  <View style={[styles.typeDot, { backgroundColor: typeColor.dot }]} />
                  <Text style={[styles.typeBadgeText, { color: typeColor.text }]}>
                    {network.type}
                  </Text>
                </View>
                {network.is_member && (
                  <View style={styles.memberBadge}>
                    <View style={[styles.memberDot, { backgroundColor: Colors.success }]} />
                    <Text style={styles.memberBadgeText}>Member</Text>
                  </View>
                )}
                {!network.is_active && (
                  <Badge label="Inactive" variant="warning" size="sm" />
                )}
              </View>
            </View>
          </View>

          {network.description ? (
            <Text style={styles.descriptionText}>{network.description}</Text>
          ) : null}
        </Card>

        {/* Stats card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <Ionicons name="people" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>
                {network.active_members_count ?? network.members_count ?? 0}
              </Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <Ionicons name="calendar-outline" size={20} color={Colors.info} />
              </View>
              <Text style={styles.statValue}>{formatDate(network.created_at)}</Text>
              <Text style={styles.statLabel}>Created</Text>
            </View>
            {network.max_members && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={styles.statIconCircle}>
                    <Ionicons name="resize-outline" size={20} color={Colors.warning} />
                  </View>
                  <Text style={styles.statValue}>{network.max_members}</Text>
                  <Text style={styles.statLabel}>Max Members</Text>
                </View>
              </>
            )}
          </View>
        </Card>

        {/* Owner info */}
        {network.owner && (
          <Card style={styles.sectionCard} title="Network Owner">
            <View style={styles.ownerRow}>
              <View style={styles.ownerIconCircle}>
                <Ionicons name="business" size={20} color={Colors.primary} />
              </View>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{network.owner.name}</Text>
                {network.owner.country && (
                  <Text style={styles.ownerDetail}>
                    {network.owner.city ? `${network.owner.city}, ` : ''}
                    {network.owner.country}
                  </Text>
                )}
                {network.owner.email && (
                  <Text style={styles.ownerDetail}>{network.owner.email}</Text>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Members list */}
        {network.members && network.members.length > 0 && (
          <Card style={styles.sectionCard} title="Members" noPadding>
            <View style={styles.membersList}>
              {network.members.map((member: Company, index: number) => (
                <View
                  key={member.id}
                  style={[
                    styles.memberRow,
                    index < (network.members?.length ?? 0) - 1 && styles.memberRowBorder,
                  ]}
                >
                  <View style={styles.memberAvatar}>
                    <Ionicons name="business-outline" size={18} color={Colors.textTertiary} />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberMeta}>
                      {member.type ? `${member.type} • ` : ''}
                      {member.country || member.city || ''}
                    </Text>
                  </View>
                  {member.is_verified && (
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  )}
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Action buttons */}
        <View style={styles.actionsSection}>
          {network.is_member ? (
            <Button
              title="Leave Network"
              onPress={handleLeave}
              variant="danger"
              size="lg"
              loading={leaveMutation.isPending}
              icon={<Ionicons name="log-out-outline" size={20} color={Colors.white} />}
            />
          ) : (
            <Button
              title="Join Network"
              onPress={() => setJoinModalVisible(true)}
              variant="primary"
              size="lg"
              icon={<Ionicons name="enter-outline" size={20} color={Colors.white} />}
            />
          )}
        </View>
      </ScrollView>

      {/* Join Modal */}
      <Modal
        visible={joinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setJoinModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join Network</Text>
              <TouchableOpacity onPress={() => setJoinModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Enter the access code to join "{network.name}".
            </Text>

            <Input
              label="Access Code"
              placeholder="Enter access code"
              value={accessCode}
              onChangeText={(text) => {
                setAccessCode(text);
                if (accessCodeError) setAccessCodeError('');
              }}
              error={accessCodeError}
              leftIcon="key-outline"
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setJoinModalVisible(false);
                  setAccessCode('');
                  setAccessCodeError('');
                }}
                variant="outline"
                size="md"
                fullWidth={false}
                style={styles.modalBtn}
              />
              <Button
                title="Join"
                onPress={handleJoin}
                variant="primary"
                size="md"
                loading={joinMutation.isPending}
                fullWidth={false}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header bar
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  headerSpacer: { width: 40 },

  // Scroll content
  scrollContent: {
    padding: Spacing.xxl,
    paddingBottom: Spacing.xxxxl,
  },

  // Error / centered
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  errorText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },

  // Info card
  infoCard: {
    marginBottom: Spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  networkName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  infoTypeBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  typeBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  memberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  memberBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.successDark,
  },
  descriptionText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Stats
  statsCard: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: Colors.borderLight,
  },

  // Section cards
  sectionCard: {
    marginBottom: Spacing.lg,
  },

  // Owner
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ownerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  ownerDetail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Members list
  membersList: {
    paddingHorizontal: Spacing.lg,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  memberMeta: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
    textTransform: 'capitalize',
  },

  // Actions
  actionsSection: {
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    width: '90%',
    maxWidth: 400,
    ...Shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  modalDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  modalBtn: {
    flex: 1,
  },
});
