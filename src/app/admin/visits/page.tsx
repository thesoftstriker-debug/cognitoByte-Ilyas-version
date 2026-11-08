"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Eye, MousePointerClick } from "lucide-react";

interface Stats {
  totalToday: number;
  totalAllTime: number;
  daily: { date: string; count: number }[];
}

export default function AdminVisitsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/visits?days=7");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStats(data.stats);
    } catch {
      toast.error("Failed to load visits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const maxDaily = stats ? Math.max(...stats.daily.map((d) => d.count), 1) : 1;
  const last7 = stats ? stats.daily.reduce((sum, d) => sum + d.count, 0) : 0;

  const cards = stats
    ? [
        { label: "Visits Today", value: stats.totalToday, icon: Eye, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        { label: "Last 7 Days", value: last7, icon: CalendarDays, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        { label: "Total Visits (All Time)", value: stats.totalAllTime, icon: MousePointerClick, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Website Visits</h1>
        <p className="text-gray-400 mt-1 text-xs sm:text-sm">
          Daily visit counts only — no IP addresses or device data are stored.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-gray-900/80 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl hover:border-brand-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 truncate font-semibold uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-black text-white mt-0.5">
                    {loading ? "—" : card.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
        <h2 className="font-bold text-white text-base mb-4 flex items-center justify-between">
          <span>Last 7 Days Traffic</span>
          <span className="text-xs font-mono text-gray-400">Peak: {maxDaily} visits</span>
        </h2>
        {loading ? (
          <p className="text-gray-400 text-sm py-16 text-center">Loading visit counts...</p>
        ) : (
          <div className="flex items-end justify-between gap-2 h-44 pt-4 border-b border-white/10 pb-2">
            {stats?.daily.map((d) => (
              <div key={d.date} className="flex flex-col items-center gap-1.5 flex-1 min-w-0 group">
                <span className="text-[10px] text-gray-400 font-mono group-hover:text-white transition-colors">{d.count}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-indigo-500 group-hover:brightness-125 transition-all shadow-sm"
                  style={{ height: `${Math.max((d.count / maxDaily) * 100, 6)}%` }}
                  title={`${d.count} visits`}
                />
                <span className="text-[10px] text-gray-400 truncate w-full text-center font-mono">
                  {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
