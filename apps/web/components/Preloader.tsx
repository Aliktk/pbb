'use client';

import { useEffect, useState } from 'react';

/**
 * Full-screen branded loader shown while the page opens, then faded out. It waits for the
 * window load event (with a safety timeout) so it never gets stuck, then removes itself from
 * the DOM. Purely visual, so it is marked aria-hidden.
 */
export function Preloader() {
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = () => setFading(true);
    if (document.readyState === 'complete') {
      const t = setTimeout(start, 350);
      return () => clearTimeout(t);
    }
    window.addEventListener('load', start);
    const safety = setTimeout(start, 2500);
    return () => {
      window.removeEventListener('load', start);
      clearTimeout(safety);
    };
  }, []);

  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(() => setGone(true), 500);
    return () => clearTimeout(t);
  }, [fading]);

  if (gone) return null;

  return (
    <div className={`preloader${fading ? ' is-hiding' : ''}`} aria-hidden="true">
      <div className="preloader-mark">
        <img src="/assets/pbb-logo.png" alt="" width={76} height={76} />
        <span className="preloader-spin" />
      </div>
    </div>
  );
}
