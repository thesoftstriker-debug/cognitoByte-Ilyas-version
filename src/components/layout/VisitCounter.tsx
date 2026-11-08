"use client";
import { useEffect, useState } from "react";

export function VisitCounter({ className = "" }: { className?: string }) {
  const [total, setTotal] = useState<number | null>(null);
  const [unique, setUnique] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/visits/today", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setTotal(typeof data.totalToday === "number" ? data.totalToday : 0);
        setUnique(typeof data.uniqueToday === "number" ? data.uniqueToday : 0);
      } catch {
        // Keep the last known value on network errors
      }
    }

    load();
    const interval = window.setInterval(load, 60000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold leading-none text-emerald-300 ${className}`}
      title={unique !== null ? `${unique.toLocaleString()} unique visitors today` : "Visits today"}
      aria-label="Today's website visits"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      <span className="tabular-nums">
        {total === null ? "· · ·" : `${total.toLocaleString()} today`}
      </span>
    </span>
  );
}
