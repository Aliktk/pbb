'use client';

import { useState } from 'react';

interface CopyButtonProps {
  value: string;
}

/** Copies an account number to the clipboard, briefly confirming (mirrors copyAcct). */
export function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`btn btn-s ${copied ? 'btn-d' : 'btn-o'}`}
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
