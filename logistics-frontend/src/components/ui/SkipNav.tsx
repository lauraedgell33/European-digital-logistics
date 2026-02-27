'use client';

import React from 'react';

export default function SkipNav() {
  return (
    <a
      href="#main-content"
      className="skip-nav-link"
    >
      Skip to main content
    </a>
  );
}

export function SkipNavTarget() {
  return <div id="main-content" tabIndex={-1} className="outline-none" />;
}
