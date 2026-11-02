"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Eye, Users, Globe, MousePointerClick, Monitor } from "lucide-react";

interface Stats {
  totalToday: number;
  uniqueToday: number;
  totalAllTime: number;
  uniqueAllTime: number;
  daily: { date: string; count: number; unique: number }[];
  topPages: { path: string; count: number }[];
}

interface Visit {
  _id: string;
  path: string;
  ip: string;
  userAgent?: string;
  referrer?: string;
  createdAt: string;
}

export default function AdminVisitsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/visits?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStats(data.stats);
      setVisits(data.visits);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load visits");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxDaily = stats ? Math.max(...stats.daily.map((d) => d.count), 1) : 1;

  const cards = stats
    ? [
        { label: "Visits Today", value: stats.totalToday, icon: Eye, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        { label: "Unique Visitors Today", value: stats.uniqueToday, icon: Users, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        { label: "Total Visits (All Time)", value: stats.totalAllTime, icon: MousePointerClick, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
        { label: "Unique Visitors (All Time)", value: stats.uniqueAllTime, icon: Globe, color: "text-brand-400 bg-brand-500/10 border-brand-500/20" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Website Visits</h1>
        <p className="text-gray-400 mt-1 text-xs sm:text-sm">Real-time visitor telemetry, page impressions, and traffic trends</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <p className="text-2xl font-black text-white mt-0.5">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <h2 className="font-bold text-white text-base mb-4 flex items-center justify-between">
            <span>Last 7 Days Traffic</span>
            <span className="text-xs font-mono text-gray-400">Peak: {maxDaily} visits</span>
          </h2>
          <div className="flex items-end justify-between gap-2 h-44 pt-4 border-b border-white/10 pb-2">
            {stats?.daily.map((d) => (
              <div key={d.date} className="flex flex-col items-center gap-1.5 flex-1 min-w-0 group">
                <span className="text-[10px] text-gray-400 font-mono group-hover:text-white transition-colors">{d.count}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-indigo-500 group-hover:brightness-125 transition-all shadow-sm"
                  style={{ height: `${Math.max((d.count / maxDaily) * 100, 6)}%` }}
                  title={`${d.count} visits · ${d.unique} unique visitors`}
                />
                <span className="text-[10px] text-gray-400 truncate w-full text-center font-mono">
                  {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <h2 className="font-bold text-white text-base mb-4">Top Pages (Last 7 Days)</h2>
          {stats && stats.topPages.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">No visits recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {stats?.topPages.map((p) => (
                <div key={p.path} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <span className="text-brand-300 text-xs font-mono truncate flex-1">{p.path}</span>
                  <span className="text-xs font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded-md border border-white/10 ml-2 shrink-0">{p.count} views</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by IP, page, or device..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder:text-gray-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all"
        />
      </div>

      <div className="bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-left">
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">IP Address</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Page</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Device / Browser</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">Loading live telemetry...</td></tr>
              ) : visits.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">No visits logged</td></tr>
              ) : (
                visits.map((v) => (
                  <tr key={v._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-300">{v.ip}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-brand-300 font-semibold">{v.path}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Monitor className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                        <span className="truncate max-w-[240px]">{v.userAgent || "—"}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap font-mono">
                      {new Date(v.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > limit && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs sm:text-sm text-gray-400 font-mono">Page {page} of {Math.ceil(total / limit)}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-white/10 hover:bg-white/10 text-white disabled:opacity-40 transition-colors">Previous</button>
            <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)} className="px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-white/10 hover:bg-white/10 text-white disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
