'use client';

import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const colorPalette = [
  { bg: 'var(--ds-blue-200)', color: 'var(--ds-blue-900)' },
  { bg: 'var(--ds-green-200)', color: 'var(--ds-green-900)' },
  { bg: 'var(--ds-amber-200)', color: 'var(--ds-amber-900)' },
  { bg: 'var(--ds-red-200)', color: 'var(--ds-red-900)' },
  { bg: '#e8d5f5', color: '#6b21a8' },
  { bg: '#d5e8f5', color: '#1e40af' },
];

function getColorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

export default function Avatar({ src, alt, name, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = `avatar-geist-${size}`;
  const initials = name ? getInitials(name) : '?';
  const color = name ? getColorForName(name) : colorPalette[0];

  if (src) {
    return (
      <div className={`avatar-geist ${sizeClass} ${className}`}>
        <img 
          src={src} 
          alt={alt || name || 'Avatar'} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials on image error
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && name) {
              parent.style.background = color.bg;
              parent.style.color = color.color;
              parent.textContent = initials;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`avatar-geist ${sizeClass} ${className}`}
      style={{ background: color.bg, color: color.color }}
      aria-label={name || 'Avatar'}
      role="img"
    >
      {initials}
    </div>
  );
}

// ─── Avatar Group ───────────────────────────────────────────
interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ children, max = 5, size = 'md' }: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const visible = childrenArray.slice(0, max);
  const remaining = childrenArray.length - max;

  return (
    <div className="avatar-group">
      {visible}
      {remaining > 0 && (
        <div 
          className={`avatar-geist avatar-geist-${size}`}
          style={{ background: 'var(--ds-gray-300)', color: 'var(--ds-gray-900)' }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
