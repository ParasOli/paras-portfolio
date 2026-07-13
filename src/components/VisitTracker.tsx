"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Fires one lightweight beacon per public page view so /admin analytics can
// show unique visitors, geography, referrers, and recent activity.
export default function VisitTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // Never track the admin/login surfaces — that's the owner, not a visitor.
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return;
    // Avoid double-counting the same path within a single client navigation.
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
