'use client';

import { useState, useRef, useCallback, DragEvent } from 'react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  preview?: boolean;
  value?: File[];
  onRemove?: (index: number) => void;
  className?: string;
  label?: string;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string }) {
  const isImage = type.startsWith('image/');
  const isPdf = type === 'application/pdf';
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {isImage ? (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </>
      ) : isPdf ? (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </>
      ) : (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </>
      )}
    </svg>
  );
}

export function FileUpload({
  onUpload,
  accept,
  maxSize,
  multiple = false,
  disabled = false,
  preview = true,
  value = [],
  onRemove,
  className,
  label,
  error,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = useCallback(
    (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      if (maxSize) {
        const oversized = fileArr.filter((f) => f.size > maxSize);
        if (oversized.length > 0) {
          setSizeError(`File(s) exceed maximum size of ${formatFileSize(maxSize)}`);
          return;
        }
      }
      setSizeError(null);
      onUpload(multiple ? fileArr : [fileArr[0]]);
    },
    [maxSize, multiple, onUpload],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      if (e.dataTransfer.files.length > 0) {
        validateAndUpload(e.dataTransfer.files);
      }
    },
    [disabled, validateAndUpload],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const displayError = error || sizeError;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
          {label}
        </label>
      )}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors duration-200 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        style={{
          borderColor: isDragOver
            ? 'var(--ds-blue-700)'
            : displayError
              ? 'var(--ds-red-700)'
              : 'var(--ds-gray-400)',
          background: isDragOver ? 'var(--ds-blue-100)' : 'var(--ds-background-100)',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: isDragOver ? 'var(--ds-blue-700)' : 'var(--ds-gray-700)' }}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div>
          <p className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
            {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="mt-1 text-[12px]" style={{ color: 'var(--ds-gray-700)' }}>
            or click to browse
            {maxSize && ` • Max ${formatFileSize(maxSize)}`}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              validateAndUpload(e.target.files);
              e.target.value = '';
            }
          }}
          aria-hidden="true"
        />
      </div>

      {displayError && (
        <p className="text-xs" style={{ color: 'var(--ds-red-900)' }}>{displayError}</p>
      )}

      {/* File list */}
      {preview && value.length > 0 && (
        <ul className="space-y-1.5" role="list" aria-label="Uploaded files">
          {value.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px]"
              style={{
                background: 'var(--ds-gray-100)',
                color: 'var(--ds-gray-1000)',
              }}
            >
              <FileIcon type={file.type} />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="shrink-0 text-[12px]" style={{ color: 'var(--ds-gray-700)' }}>
                {formatFileSize(file.size)}
              </span>
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(idx);
                  }}
                  className="shrink-0 rounded p-0.5 transition-colors hover:bg-[var(--ds-gray-300)]"
                  style={{ color: 'var(--ds-gray-700)' }}
                  aria-label={`Remove ${file.name}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
