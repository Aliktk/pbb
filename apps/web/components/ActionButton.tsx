'use client';

import type { CSSProperties, ReactNode } from 'react';
import { showToast } from '../lib/toast';

interface ActionButtonProps {
  className?: string;
  style?: CSSProperties;
  /** Toast shown on click — describes what this action will do once the API is wired. */
  message?: string;
  children: ReactNode;
  ariaLabel?: string;
}

/**
 * A placeholder action button for the design phase: it acknowledges the click with a toast
 * instead of doing nothing, so no control is silently dead (INV-9). Replace with a real
 * handler (POST/PATCH to the API) as each screen is wired to the backend.
 */
export function ActionButton({ className, style, message = 'This writes to the API once the backend is connected.', children, ariaLabel }: ActionButtonProps) {
  return (
    <button type="button" className={className} style={style} aria-label={ariaLabel} onClick={() => showToast(message)}>
      {children}
    </button>
  );
}
