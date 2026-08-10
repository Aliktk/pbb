'use client';

import { useState } from 'react';

/**
 * Dismissible announcement strip. In production the content comes from the Announcements
 * CMS (T7) with end-dated items that expire themselves; for now it mirrors the prototype.
 */
export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="ann" id="ann">
      <div className="wrap">
        <span className="tg">Camp</span>
        <span>Free blood donation camp — Pishin branch, 12 September, 9am to 4pm.</span>
        <button className="x" onClick={() => setOpen(false)} aria-label="Dismiss" type="button">✕</button>
      </div>
    </div>
  );
}
