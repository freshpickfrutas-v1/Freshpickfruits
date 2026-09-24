import React from 'react';

/** Drawn blueberry icon (the 🫐 emoji does not render on Windows 10). */
export const BlueberryIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
    <circle cx="11" cy="19" r="8" fill="#7663CF" />
    <circle cx="21" cy="13" r="8" fill="#9483E3" />
    <circle cx="9" cy="16.5" r="2.2" fill="#fff" opacity="0.18" />
    <circle cx="19" cy="10.5" r="2.2" fill="#fff" opacity="0.18" />
    <path d="M21 10.2l1.1 1.6 1.9-.4-.9 1.7 1.3 1.4-1.9.2-.5 1.9-1-1.6-1.9.5.9-1.7-1.3-1.4 1.9-.2z" fill="#3B2A78" transform="translate(-0.5 1.2) scale(0.95)" />
    <path d="M11 16.2l1.1 1.6 1.9-.4-.9 1.7 1.3 1.4-1.9.2-.5 1.9-1-1.6-1.9.5.9-1.7-1.3-1.4 1.9-.2z" fill="#3B2A78" transform="translate(-0.5 1.2) scale(0.95)" />
  </svg>
);
