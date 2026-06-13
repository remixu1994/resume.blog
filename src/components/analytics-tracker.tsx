'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Lightweight privacy-friendly analytics tracker.
 * Sends page view events via sendBeacon (non-blocking, fires even on page unload).
 * Debounces duplicate path tracking within 5 seconds.
 * No cookies, no personal data collected.
 */
export function AnalyticsTracker({ locale }: { locale: string }) {
  const pathname = usePathname();
  const lastTrackRef = useRef<{ path: string; time: number }>({ path: '', time: 0 });

  useEffect(() => {
    const fullPath = `/${locale}${pathname}`;

    // Debounce: skip if same path tracked within 5 seconds
    const now = Date.now();
    if (lastTrackRef.current.path === fullPath && now - lastTrackRef.current.time < 5000) {
      return;
    }
    lastTrackRef.current = { path: fullPath, time: now };

    const payload = JSON.stringify({
      path: fullPath,
      locale,
      referrer: document.referrer || '',
    });

    // Use sendBeacon for non-blocking fire-and-forget
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      // Fallback: fetch with keepalive
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silently ignore failures — analytics should never break the page
      });
    }
  }, [pathname, locale]);

  return null;
}
