'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { messageApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface Conversation {
  id: number;
  subject: string | null;
  type: string;
  latest_message: { body: string; sender: { name: string }; created_at: string } | null;
  participants: { id: number; name: string; email: string; company?: { name: string } }[];
  unread_count: number;
  updated_at: string;
}

interface Message {
  id: number;
  body: string;
  type: string;
  user_id: number;
  sender: { id: number; name: string; email: string };
  created_at: string;
  metadata?: Record<string, unknown>;
}

export default function MessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [newConvModal, setNewConvModal] = useState(false);
  const [newConvForm, setNewConvForm] = useState({ recipient_id: '', subject: '', message: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await messageApi.conversations();
      setConversations(res.data.data || res.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: number) => {
    setLoadingMessages(true);
    try {
      const res = await messageApi.messages(convId);
      setMessages(res.data.data || res.data || []);
      await messageApi.markRead(convId);
      // Update unread count in local state
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
      );
    } catch {
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // When active conversation changes
  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
      // Poll for new messages every 5 seconds
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        fetchMessages(activeConv.id);
      }, 5000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeConv, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await messageApi.sendMessage(activeConv.id, { body: newMessage });
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage('');
      // Update latest message in conversation list
      fetchConversations();
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = async () => {
    if (!newConvForm.recipient_id || !newConvForm.message) return;
    try {
      const res = await messageApi.startConversation({
        recipient_id: parseInt(newConvForm.recipient_id),
        subject: newConvForm.subject || undefined,
        message: newConvForm.message,
      });
      const conv = res.data.data;
      setConversations((prev) => [conv, ...prev]);
      setActiveConv(conv);
      setNewConvModal(false);
      setNewConvForm({ recipient_id: '', subject: '', message: '' });
    } catch {}
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants?.find((p) => p.id !== user?.id) || conv.participants?.[0];
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter((c) => {
    if (!search) return true;
    const other = getOtherParticipant(c);
    return (
      other?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase()) ||
      other?.company?.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] animate-fade-in">
      {/* Conversation List */}
      <div
        className="w-80 flex-shrink-0 flex flex-col"
        style={{ borderRight: '1px solid var(--ds-gray-400)' }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--ds-gray-300)' }}>
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
            {t('messages.title')}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setNewConvModal(true)}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--ds-gray-700)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('messages.conversations') + '...'}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px] outline-none"
              style={{
                background: 'var(--ds-gray-100)',
                border: '1px solid var(--ds-gray-400)',
                color: 'var(--ds-gray-1000)',
              }}
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <ChatBubbleLeftRightIcon className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--ds-gray-500)' }} />
              <p className="text-[13px]" style={{ color: 'var(--ds-gray-700)' }}>
                {search ? t('common.noResults') : t('messages.noMessages')}
              </p>
              <Button variant="secondary" size="sm" className="mt-3" onClick={() => setNewConvModal(true)}>
                {t('messages.startConversation')}
              </Button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = activeConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={cn(
                    'w-full text-left px-4 py-3 transition-colors flex gap-3',
                  )}
                  style={{
                    background: isActive ? 'var(--ds-gray-200)' : 'transparent',
                    borderBottom: '1px solid var(--ds-gray-200)',
                  }}
                >
                  <Avatar name={other?.name || '?'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={cn('text-[13px] truncate', conv.unread_count > 0 ? 'font-bold' : 'font-medium')}
                        style={{ color: 'var(--ds-gray-1000)' }}
                      >
                        {other?.name || 'Unknown'}
                      </p>
                      <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--ds-gray-700)' }}>
                        {conv.latest_message ? timeAgo(conv.latest_message.created_at) : ''}
                      </span>
                    </div>
                    {other?.company?.name && (
                      <p className="text-[11px] truncate" style={{ color: 'var(--ds-gray-700)' }}>
                        {other.company.name}
                      </p>
                    )}
                    {conv.latest_message && (
                      <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--ds-gray-800)' }}>
                        {conv.latest_message.body}
                      </p>
                    )}
                  </div>
                  {conv.unread_count > 0 && (
                    <span
                      className="flex-shrink-0 self-center h-5 w-5 flex items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: 'var(--ds-blue-700)', color: '#fff' }}
                    >
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div
              className="px-6 py-3 flex items-center gap-3"
              style={{ borderBottom: '1px solid var(--ds-gray-300)' }}
            >
              <Avatar name={getOtherParticipant(activeConv)?.name || '?'} size="sm" />
              <div>
                <p className="text-[14px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
                  {getOtherParticipant(activeConv)?.name}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--ds-gray-700)' }}>
                  {activeConv.subject || getOtherParticipant(activeConv)?.company?.name || ''}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.user_id === user?.id || msg.sender?.id === user?.id;
                  const showAvatar = i === messages.length - 1 || messages[i + 1]?.user_id !== msg.user_id;
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}
                    >
                      {!isMine && showAvatar && (
                        <Avatar name={msg.sender?.name || '?'} size="sm" />
                      )}
                      {!isMine && !showAvatar && <div className="w-6" />}
                      <div
                        className="max-w-[70%] rounded-2xl px-4 py-2.5"
                        style={{
                          background: isMine ? 'var(--ds-blue-700)' : 'var(--ds-gray-200)',
                          color: isMine ? '#fff' : 'var(--ds-gray-1000)',
                        }}
                      >
                        {!isMine && showAvatar && (
                          <p className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--ds-gray-900)' }}>
                            {msg.sender?.name}
                          </p>
                        )}
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                        <p
                          className="text-[10px] mt-1 text-right"
                          style={{ opacity: 0.7 }}
                        >
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="px-4 py-3 flex items-end gap-2"
              style={{ borderTop: '1px solid var(--ds-gray-300)' }}
            >
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('messages.typeMessage')}
                rows={1}
                className="flex-1 resize-none rounded-xl px-4 py-2.5 text-[13px] outline-none"
                style={{
                  background: 'var(--ds-gray-100)',
                  border: '1px solid var(--ds-gray-400)',
                  color: 'var(--ds-gray-1000)',
                  maxHeight: '120px',
                }}
              />
              <Button
                size="sm"
                onClick={handleSend}
                loading={sending}
                disabled={!newMessage.trim()}
                className="rounded-xl"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--ds-gray-400)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--ds-gray-800)' }}>
                {t('messages.noConversation')}
              </h3>
              <p className="text-[13px] mt-1" style={{ color: 'var(--ds-gray-700)' }}>
                {t('messages.noConversationDesc')}
              </p>
              <Button variant="secondary" className="mt-4" onClick={() => setNewConvModal(true)}>
                <PlusIcon className="h-4 w-4 mr-2" /> {t('messages.newMessage')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <Modal open={newConvModal} onClose={() => setNewConvModal(false)} title={t('messages.newMessage')} size="md">
        <div className="space-y-4">
          <Input
            label="Recipient User ID"
            type="number"
            value={newConvForm.recipient_id}
            onChange={(e) => setNewConvForm((p) => ({ ...p, recipient_id: e.target.value }))}
            placeholder="Enter user ID"
            required
          />
          <Input
            label="Subject"
            value={newConvForm.subject}
            onChange={(e) => setNewConvForm((p) => ({ ...p, subject: e.target.value }))}
            placeholder="e.g. Inquiry about FTL Munich → Paris"
          />
          <Textarea
            label="Message *"
            value={newConvForm.message}
            onChange={(e) => setNewConvForm((p) => ({ ...p, message: e.target.value }))}
            placeholder="Write your message..."
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setNewConvModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleNewConversation} disabled={!newConvForm.recipient_id || !newConvForm.message}>
              {t('messages.send')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
