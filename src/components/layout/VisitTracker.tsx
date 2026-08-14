"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function VisitTracker() {
  const pathname = usePathname();
  const lastSent = useRef<Record<string, number>>({});

  useEffect(() => {
    const now = Date.now();
    const last = lastSent.current[pathname];
    if (last && now - last < 30000) return;
    lastSent.current[pathname] = now;

    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}