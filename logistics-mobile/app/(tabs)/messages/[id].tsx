import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { t } from '@/lib/i18n';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { Message } from '@/types';
import { format, isToday, isYesterday } from 'date-fns';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const locale = useAppStore((s) => s.locale);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const [messageText, setMessageText] = useState('');

  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const res = await messageApi.messages(Number(id));
      return (res.data.data || res.data) as Message[];
    },
    enabled: !!id,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => messageApi.sendMessage(Number(id), { body: text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageText('');
    },
  });

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMutation.mutate(messageText.trim());
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`;
    return format(date, 'MMM dd, HH:mm');
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.user_id === user?.id;
    const showDate = index === 0 || (
      messages && messages[index - 1] &&
      new Date(item.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString()
    );

    return (
      <View>
        {showDate && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>
              {isToday(new Date(item.created_at))
                ? 'Today'
                : isYesterday(new Date(item.created_at))
                ? 'Yesterday'
                : format(new Date(item.created_at), 'MMMM dd, yyyy')}
            </Text>
          </View>
        )}
        <View style={[styles.messageBubbleContainer, isOwn ? styles.ownContainer : styles.otherContainer]}>
          {!isOwn && (
            <View style={styles.otherAvatar}>
              <Text style={styles.otherAvatarText}>
                {item.sender?.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
            <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
              {item.body}
            </Text>
            <Text style={[styles.timeText, isOwn ? styles.ownTimeText : styles.otherTimeText]}>
              {formatMessageTime(item.created_at)}
              {isOwn && (
                <Text> {item.read_at ? '✓✓' : '✓'}</Text>
              )}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>C</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t('messages.chat', locale)}</Text>
          <Text style={styles.headerSubtitle}>{messages?.length || 0} {t('messages.messages', locale)}</Text>
        </View>
        <TouchableOpacity onPress={() => refetch()}>
          <Ionicons name="refresh" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages || []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={() => (
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyChatText}>{t('messages.startConversation', locale)}</Text>
            </View>
          )}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={t('messages.typeMessage', locale)}
              placeholderTextColor={Colors.textTertiary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={2000}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!messageText.trim() || sendMutation.isPending}
          >
            <Ionicons name="send" size={20} color={messageText.trim() ? Colors.white : Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  backBtn: {},
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  headerAvatarText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  headerSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  messagesList: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg, flexGrow: 1 },
  dateHeader: { alignSelf: 'center', marginVertical: Spacing.md, backgroundColor: Colors.neutralLight, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  dateHeaderText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  messageBubbleContainer: { flexDirection: 'row', marginBottom: Spacing.sm, maxWidth: '80%' },
  ownContainer: { alignSelf: 'flex-end' },
  otherContainer: { alignSelf: 'flex-start', gap: Spacing.sm },
  otherAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.neutralLight, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  otherAvatarText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  bubble: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, maxWidth: '100%' },
  ownBubble: { backgroundColor: Colors.primary, borderRadius: 20, borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: Colors.card, borderRadius: 20, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  messageText: { fontSize: FontSize.md, lineHeight: 22 },
  ownMessageText: { color: Colors.white },
  otherMessageText: { color: Colors.text },
  timeText: { fontSize: 10, marginTop: Spacing.xs },
  ownTimeText: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  otherTimeText: { color: Colors.textTertiary },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md, paddingTop: 100 },
  emptyChatText: { fontSize: FontSize.md, color: Colors.textTertiary },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.card, gap: Spacing.sm,
  },
  inputContainer: {
    flex: 1, backgroundColor: Colors.background, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
    maxHeight: 120,
  },
  textInput: { fontSize: FontSize.md, color: Colors.text, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.neutralLight },
});
