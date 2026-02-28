import type { User } from './auth';

// ── Conversation & Message ────────────────────────────
export interface Conversation {
  id: number;
  subject?: string;
  type: 'direct' | 'freight_inquiry' | 'order_discussion' | 'tender_discussion';
  creator_id: number;
  creator?: User;
  last_message_at?: string;
  messages_count?: number;
  unread_count?: number;
  participants?: User[];
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender?: User;
  body: string;
  type: 'text' | 'file' | 'system';
  metadata?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}

// ── Input Types ───────────────────────────────────────
export interface MessageInput {
  body: string;
  type?: 'text' | 'file' | 'system';
  metadata?: Record<string, unknown>;
}

export interface ConversationStartInput {
  recipient_id: number;
  message: string;
  subject?: string;
  type?: string;
  reference_type?: string;
  reference_id?: number;
}

// ── WebSocket Events ──────────────────────────────────
export interface NewMessageEvent {
  conversation_id: number;
  message: {
    id: number;
    body: string;
    sender_id: number;
    type: string;
    created_at: string;
  };
}
