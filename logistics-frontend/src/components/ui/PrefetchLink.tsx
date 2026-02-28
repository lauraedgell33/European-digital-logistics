'use client';

import React, { useState, useCallback } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PrefetchLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  showLoadingIndicator?: boolean;
}

export function PrefetchLink({
  children,
  className,
  activeClassName,
  showLoadingIndicator = false,
  href,
  ...props
}: PrefetchLinkProps) {
  const [isPrefetched, setIsPrefetched] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleMouseEnter = useCallback(() => {
    if (!isPrefetched) {
      router.prefetch(typeof href === 'string' ? href : href.pathname || '/');
      setIsPrefetched(true);
    }
  }, [href, isPrefetched, router]);

  const handleClick = useCallback(() => {
    if (showLoadingIndicator) {
      setIsNavigating(true);
    }
  }, [showLoadingIndicator]);

  return (
    <Link
      href={href}
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      onClick={handleClick}
      prefetch={false}
      {...props}
    >
      {children}
      {isNavigating && showLoadingIndicator && (
        <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
    </Link>
  );
}
