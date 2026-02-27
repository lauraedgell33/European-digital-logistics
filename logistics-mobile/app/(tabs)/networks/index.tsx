import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { networkApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { PartnerNetwork, PaginatedResponse } from '@/types';

// ── Network type color mapping ────────────────────────
const NETWORK_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  consortium: { bg: Colors.primaryBg, text: Colors.primary, dot: Colors.primaryLight },
  alliance: { bg: Colors.infoLight, text: Colors.infoDark, dot: Colors.info },
  marketplace: { bg: Colors.warningLight, text: Colors.warningDark, dot: Colors.warning },
  cooperative: { bg: Colors.successLight, text: Colors.successDark, dot: Colors.success },
};

const FILTER_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'consortium', label: 'Consortium' },
  { key: 'alliance', label: 'Alliance' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'cooperative', label: 'Cooperative' },
] as const;

export default function NetworksScreen() {
  const addNotification = useAppStore((s) => s.addNotification);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');

  // ── Data fetching ─────────────────────────────────────
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['networks', activeFilter, search],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, any> = { page: pageParam, per_page: 20 };
      if (activeFilter !== 'all') params.type = activeFilter;
      if (search) params.search = search;
      const res = await networkApi.list(params);
      return res.data as PaginatedResponse<PartnerNetwork>;
    },
    getNextPageParam: (lastPage: PaginatedResponse<PartnerNetwork>) => {
      if (lastPage.current_page < lastPage.last_page) return lastPage.current_page + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const networks = data?.pages.flatMap((page) => page.data) || [];

  // ── Join mutation ─────────────────────────────────────
  const joinMutation = useMutation({
    mutationFn: (code: string) => networkApi.join(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networks'] });
      addNotification({ type: 'success', title: 'Successfully joined network' });
      setJoinModalVisible(false);
      setAccessCode('');
      setAccessCodeError('');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Invalid access code or unable to join network';
      setAccessCodeError(message);
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

  const handleFilterChange = useCallback((key: string) => {
    setActiveFilter(key);
  }, []);

  // ── Network card ──────────────────────────────────────
  const renderNetworkCard = useCallback(
    ({ item }: { item: PartnerNetwork }) => {
      const typeColor = NETWORK_TYPE_COLORS[item.type] || NETWORK_TYPE_COLORS.consortium;

      return (
        <Card
          style={styles.networkCard}
          onPress={() => router.push(`/(tabs)/networks/${item.id}` as any)}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.name}
              </Text>
            </View>
            <View style={styles.badgeRow}>
              {item.is_member && (
                <View style={styles.memberBadge}>
                  <View style={[styles.memberDot, { backgroundColor: Colors.success }]} />
                  <Text style={styles.memberBadgeText}>Member</Text>
                </View>
              )}
              <View style={[styles.typeBadge, { backgroundColor: typeColor.bg }]}>
                <View style={[styles.typeDot, { backgroundColor: typeColor.dot }]} />
                <Text style={[styles.typeBadgeText, { color: typeColor.text }]}>
                  {item.type}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Ionicons name="people-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.footerText}>
                {item.active_members_count ?? item.members_count ?? 0} members
              </Text>
            </View>
            {item.owner && (
              <View style={styles.footerItem}>
                <Ionicons name="business-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.footerText} numberOfLines={1}>
                  {item.owner.name}
                </Text>
              </View>
            )}
          </View>
        </Card>
      );
    },
    [],
  );

  // ── Loading ───────────────────────────────────────────
  if (isLoading && !data) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Networks</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search networks..."
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

      {/* Filter chips */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_CHIPS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item: chip }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === chip.key && styles.filterChipActive]}
              onPress={() => handleFilterChange(chip.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === chip.key && styles.filterChipTextActive,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Network list */}
      <FlatList
        data={networks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNetworkCard}
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
            icon="globe-outline"
            title="No networks found"
            description="There are no partner networks matching your criteria."
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color={Colors.primary}
            />
          ) : null
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setJoinModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="key-outline" size={22} color={Colors.white} />
        <Text style={styles.fabText}>Join by Code</Text>
      </TouchableOpacity>

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
              Enter the access code provided by the network owner to join their partner network.
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
                title="Join Network"
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

  // Header
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

  // Search
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

  // Filter chips
  filterContainer: {
    marginBottom: Spacing.md,
  },
  filterScroll: {
    paddingHorizontal: Spacing.xxl,
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
  listContent: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },

  // Network card
  networkCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardTitleWrap: { flex: 1 },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  badgeRow: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: Spacing.xs,
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
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 1,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  footerLoader: {
    paddingVertical: Spacing.xl,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: Spacing.xxl,
    right: Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    ...Shadow.lg,
  },
  fabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
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
