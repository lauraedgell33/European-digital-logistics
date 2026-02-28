'use client';

import React, { useRef, useCallback, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  toolbar?: ('bold' | 'italic' | 'underline' | 'link' | 'list')[];
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  label?: string;
  error?: string;
}

type ToolbarAction = 'bold' | 'italic' | 'underline' | 'link' | 'list';

const toolbarIcons: Record<ToolbarAction, { label: string; path: string }> = {
  bold: {
    label: 'Bold',
    path: 'M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z',
  },
  italic: {
    label: 'Italic',
    path: 'M19 4h-9 M14 20H5 M15 4L9 20',
  },
  underline: {
    label: 'Underline',
    path: 'M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3 M4 21h16',
  },
  link: {
    label: 'Link',
    path: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  },
  list: {
    label: 'List',
    path: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  },
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  toolbar = ['bold', 'italic', 'underline', 'link', 'list'],
  disabled = false,
  maxLength,
  className,
  label,
  error,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback(
    (command: string, val?: string) => {
      if (disabled) return;
      editorRef.current?.focus();
      document.execCommand(command, false, val);
      // Trigger onChange with updated content
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        if (html === '<br>' || html === '<div><br></div>') {
          onChange('');
        } else {
          onChange(html);
        }
      }
    },
    [disabled, onChange],
  );

  const handleToolbarClick = useCallback(
    (action: ToolbarAction) => {
      switch (action) {
        case 'bold':
          execCommand('bold');
          break;
        case 'italic':
          execCommand('italic');
          break;
        case 'underline':
          execCommand('underline');
          break;
        case 'link': {
          const url = prompt('Enter URL:');
          if (url) execCommand('createLink', url);
          break;
        }
        case 'list':
          execCommand('insertUnorderedList');
          break;
      }
    },
    [execCommand],
  );

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      let html = editorRef.current.innerHTML;
      if (html === '<br>' || html === '<div><br></div>') {
        html = '';
      }
      if (maxLength) {
        const text = editorRef.current.textContent || '';
        if (text.length > maxLength) {
          editorRef.current.textContent = text.slice(0, maxLength);
          html = editorRef.current.innerHTML;
        }
      }
      onChange(html);
    }
  }, [onChange, maxLength]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      // Keyboard shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            execCommand('underline');
            break;
        }
      }
    },
    [disabled, execCommand],
  );

  const textLength = editorRef.current?.textContent?.length || 0;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
          {label}
        </label>
      )}
      <div
        className="overflow-hidden rounded-lg"
        style={{
          border: error ? '1px solid var(--ds-red-700)' : '1px solid var(--ds-gray-400)',
          background: 'var(--ds-background-100)',
        }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center gap-0.5 px-2 py-1.5"
          style={{ borderBottom: '1px solid var(--ds-gray-400)' }}
          role="toolbar"
          aria-label="Text formatting"
        >
          {toolbar.map((action) => {
            const icon = toolbarIcons[action];
            return (
              <button
                key={action}
                type="button"
                onClick={() => handleToolbarClick(action)}
                disabled={disabled}
                className={cn(
                  'rounded p-1.5 transition-colors',
                  disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--ds-gray-200)]',
                )}
                style={{ color: 'var(--ds-gray-900)' }}
                aria-label={icon.label}
                title={icon.label}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={icon.path} />
                </svg>
              </button>
            );
          })}
        </div>

        {/* Editor area */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          role="textbox"
          aria-multiline="true"
          aria-label={label || 'Rich text editor'}
          aria-invalid={!!error}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className={cn(
            'min-h-[120px] px-3 py-2.5 text-[14px] outline-none',
            disabled && 'opacity-50 cursor-not-allowed',
            !value && 'empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--ds-gray-700)]',
          )}
          style={{
            color: 'var(--ds-gray-1000)',
          }}
          data-placeholder={placeholder}
          dangerouslySetInnerHTML={{ __html: value }}
        />

        {/* Footer with char count */}
        {maxLength && (
          <div
            className="flex justify-end px-3 py-1.5 text-[11px]"
            style={{
              borderTop: '1px solid var(--ds-gray-200)',
              color: textLength > maxLength * 0.9 ? 'var(--ds-red-900)' : 'var(--ds-gray-700)',
            }}
          >
            {textLength}/{maxLength}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs" style={{ color: 'var(--ds-red-900)' }}>{error}</p>
      )}
    </div>
  );
}
