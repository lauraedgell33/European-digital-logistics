'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useCopilotStore } from '@/stores/copilotStore';
import type { CopilotMessage, CopilotAction } from '@/stores/copilotStore';
import { copilotApi } from '@/lib/api';
import { cn } from '@/lib/utils';

/* ──────────────────────────────────────────────
   Typing indicator (3 bouncing dots)
   ────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 mb-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      >
        <SparklesIcon className="w-3.5 h-3.5 text-white" />
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center"
        style={{ background: 'var(--ds-background-100)' }}
      >
        <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Single chat bubble
   ────────────────────────────────────────────── */
function ChatBubble({ message }: { message: CopilotMessage }) {
  const router = useRouter();
  const isUser = message.role === 'user';

  const handleAction = (action: CopilotAction) => {
    if (action.url.startsWith('http')) {
      window.open(action.url, '_blank');
    } else {
      router.push(action.url);
    }
  };

  return (
    <div className={cn('flex mb-3', isUser ? 'justify-end' : 'justify-start')}>
      {/* assistant avatar */}
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <SparklesIcon className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className={cn('max-w-[85%] flex flex-col gap-2', isUser && 'items-end')}>
        {/* bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
            isUser
              ? 'rounded-tr-sm bg-blue-600 text-white'
              : 'rounded-tl-sm'
          )}
          style={!isUser ? { background: 'var(--ds-background-100)', color: 'var(--ds-gray-1000)' } : undefined}
        >
          {renderMarkdown(message.content)}
        </div>

        {/* data items — compact cards */}
        {message.data && Array.isArray((message.data as Record<string, unknown>).items) && (
          <div className="w-full flex flex-col gap-1.5 mt-1">
            {(((message.data as Record<string, unknown>).items) as Record<string, unknown>[]).slice(0, 5).map((item, i) => (
              <div
                key={i}
                className="rounded-lg px-3 py-2 text-xs border"
                style={{
                  background: 'var(--ds-background)',
                  borderColor: 'var(--ds-gray-200)',
                  color: 'var(--ds-gray-900)',
                }}
              >
                {Object.entries(item)
                  .filter(([k]) => k !== 'id')
                  .map(([key, val]) => (
                    <span key={key} className="mr-3 inline-block">
                      <span className="font-medium capitalize" style={{ color: 'var(--ds-gray-600)' }}>
                        {key.replace(/_/g, ' ')}:
                      </span>{' '}
                      {String(val ?? '—')}
                    </span>
                  ))}
              </div>
            ))}
          </div>
        )}

        {/* action buttons */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {message.actions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleAction(action)}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
                style={{
                  background: 'var(--ds-background-100)',
                  color: 'var(--ds-blue-900)',
                  border: '1px solid var(--ds-gray-200)',
                }}
              >
                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* timestamp */}
        <span className="text-[10px] px-1" style={{ color: 'var(--ds-gray-500)' }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Simple markdown-ish renderer (bold, italic)
   ────────────────────────────────────────────── */
function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* ══════════════════════════════════════════════
   Main CopilotWidget
   ══════════════════════════════════════════════ */
export default function CopilotWidget() {
  const {
    isOpen,
    messages,
    isLoading,
    toggleOpen,
    setOpen,
    addMessage,
    setLoading,
    clearMessages,
  } = useCopilotStore();

  const router = useRouter();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── scroll helpers ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setShowScrollDown(!atBottom);
  }, []);

  /* ── keyboard shortcut Ctrl+. ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '.') {
        e.preventDefault();
        toggleOpen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleOpen]);

  /* ── focus input on open ── */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  /* ── fetch initial suggestions once ── */
  useEffect(() => {
    if (isOpen && suggestions.length === 0 && messages.length === 0) {
      copilotApi
        .suggestions()
        .then((r) => setSuggestions(r.data?.data ?? []))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ── send message ── */
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      addMessage({ role: 'user', content: trimmed });
      setInput('');
      setLoading(true);

      try {
        const res = await copilotApi.chat({ message: trimmed });
        const data = res.data?.data;
        addMessage({
          role: 'assistant',
          content: data?.message ?? "Sorry, I couldn't process that.",
          type: data?.type ?? 'text',
          data: data?.data ?? null,
          suggestions: data?.suggestions ?? [],
          actions: data?.actions ?? [],
        });

        // update suggestion chips
        if (data?.suggestions?.length) {
          setSuggestions(data.suggestions);
        }
      } catch {
        addMessage({
          role: 'assistant',
          content: 'Oops — something went wrong. Please try again.',
          type: 'text',
        });
      } finally {
        setLoading(false);
      }
    },
    [isLoading, addMessage, setLoading],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  /* ── latest assistant suggestions for chips ── */
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const chipSuggestions = lastAssistant?.suggestions?.length ? lastAssistant.suggestions : suggestions;

  /* ──────────────────────────────────────────── */
  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={toggleOpen}
        aria-label="Toggle AI Copilot"
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
          isOpen ? 'scale-0 pointer-events-none' : 'scale-100',
        )}
        style={{
          width: 56,
          height: 56,
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        }}
      >
        <SparklesIcon className="w-6 h-6 text-white" />
      </button>

      {/* ── Chat panel ── */}
      <div
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 origin-bottom-right',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none',
          // mobile → full-screen
          'bottom-0 right-0 w-full h-full sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[540px] sm:rounded-2xl',
        )}
        style={{
          background: 'var(--ds-background)',
          border: '1px solid var(--ds-gray-200)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          }}
        >
          <div className="flex items-center gap-2 text-white">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-semibold text-sm">LogiMarket Copilot</span>
            <span className="text-[10px] opacity-70 ml-1 rounded-full bg-white/20 px-2 py-0.5">AI</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearMessages}
              title="Clear chat"
              className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setOpen(false)}
              title="Close (Ctrl+.)"
              className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar relative"
          style={{ color: 'var(--ds-gray-1000)' }}
        >
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 pb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--ds-gray-1000)' }}>
                  Hi! I&rsquo;m your LogiMarket Copilot
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--ds-gray-600)' }}>
                  Ask me about freight, vehicles, orders, pricing, or any platform feature.
                </p>
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--ds-gray-400)' }}>
                Press <kbd className="px-1 py-0.5 rounded text-[10px] border" style={{ borderColor: 'var(--ds-gray-300)' }}>Ctrl</kbd>
                +
                <kbd className="px-1 py-0.5 rounded text-[10px] border" style={{ borderColor: 'var(--ds-gray-300)' }}>.</kbd>
                {' '}to toggle
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Scroll-to-bottom fab ── */}
        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-[120px] left-1/2 -translate-x-1/2 z-10 rounded-full p-1.5 shadow-md transition-colors"
            style={{ background: 'var(--ds-background-100)', color: 'var(--ds-gray-700)' }}
          >
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        )}

        {/* ── Suggestion chips ── */}
        {chipSuggestions.length > 0 && !isLoading && (
          <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto flex-shrink-0 custom-scrollbar">
            {chipSuggestions.slice(0, 4).map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium transition-colors hover:opacity-80 flex-shrink-0 border"
                style={{
                  background: 'var(--ds-background-100)',
                  color: 'var(--ds-gray-800)',
                  borderColor: 'var(--ds-gray-200)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* ── Input ── */}
        <div
          className="px-3 py-2.5 flex items-center gap-2 flex-shrink-0 border-t"
          style={{ borderColor: 'var(--ds-gray-200)' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything…"
            disabled={isLoading}
            className="flex-1 text-sm rounded-xl px-4 py-2 outline-none border transition-colors disabled:opacity-50"
            style={{
              background: 'var(--ds-background-100)',
              color: 'var(--ds-gray-1000)',
              borderColor: 'var(--ds-gray-200)',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-xl text-white transition-all disabled:opacity-40 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
