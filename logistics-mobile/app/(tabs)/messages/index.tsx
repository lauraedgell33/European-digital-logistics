import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { messageApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { t } from '@/lib/i18n';
import LoadingScreen from '@/components/ui/LoadingScreen';
import EmptyState from '@/components/ui/EmptyState';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { Conversation } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationsScreen() {
  const locale = useAppStore((s) => s.locale);
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');

  const { data: conversations, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await messageApi.conversations();
      return (res.data.data || res.data) as Conversation[];
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const filteredConversations = conversations?.filter((c) => {
    if (!search) return true;
    const otherUser = c.participants?.find((p: any) => p.id !== user?.id);
    return otherUser?.name?.toLowerCase().includes(search.toLowerCase());
  }) || [];

  const totalUnread = conversations?.reduce((acc, c) => acc + (c.unread_count || 0), 0) || 0;
  React.useEffect(() => { setUnreadCount(totalUnread); }, [totalUnread]);

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherUser = item.participants?.find((p: any) => p.id !== user?.id);
    const hasUnread = (item.unread_count || 0) > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, hasUnread && styles.unreadItem]}
        onPress={() => router.push(`/(tabs)/messages/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {otherUser?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
          {hasUnread && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, hasUnread && styles.unreadText]} numberOfLines={1}>
              {otherUser?.name || t('messages.unknown', locale)}
            </Text>
            <Text style={styles.timeText}>
              {item.last_message_at ? formatDistanceToNow(new Date(item.last_message_at), { addSuffix: false }) : ''}
            </Text>
          </View>
          <View style={styles.conversationFooter}>
            <Text style={[styles.lastMessage, hasUnread && styles.unreadMessage]} numberOfLines={1}>
              {item.last_message?.body || t('messages.noMessages', locale)}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('nav.messages', locale)}</Text>
        {totalUnread > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{totalUnread}</Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('messages.searchConversations', locale)}
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

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderConversation}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <EmptyState
            icon="chatbubbles-outline"
            title={t('messages.noConversations', locale)}
            description={t('messages.noConversationsDesc', locale)}
          />
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg, gap: Spacing.sm },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.text },
  headerBadge: { backgroundColor: Colors.danger, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, minWidth: 24, alignItems: 'center' },
  headerBadgeText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  searchContainer: { paddingHorizontal: Spacing.xxl, marginBottom: Spacing.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  list: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl },
  conversationItem: { flexDirection: 'row', paddingVertical: Spacing.lg, gap: Spacing.md },
  unreadItem: {},
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  avatarText: { color: Colors.white, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.background },
  conversationContent: { flex: 1, justifyContent: 'center' },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  userName: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text, flex: 1 },
  unreadText: { fontWeight: FontWeight.bold },
  timeText: { fontSize: FontSize.xs, color: Colors.textTertiary, marginLeft: Spacing.sm },
  conversationFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  unreadMessage: { color: Colors.text, fontWeight: FontWeight.medium },
  unreadBadge: { backgroundColor: Colors.primary, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginLeft: Spacing.sm },
  unreadBadgeText: { color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold },
  separator: { height: 1, backgroundColor: Colors.border },
});
