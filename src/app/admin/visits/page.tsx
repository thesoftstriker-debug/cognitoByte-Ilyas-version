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
        { label: "Visits Today", value: stats.totalToday, icon: Eye },
        { label: "Unique Visitors Today", value: stats.uniqueToday, icon: Users },
        { label: "Total Visits (All Time)", value: stats.totalAllTime, icon: MousePointerClick },
        { label: "Unique Visitors (All Time)", value: stats.uniqueAllTime, icon: Globe },
      ]
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Website Visits</h1>
        <p className="text-gray-500 text-xs sm:text-sm">Track visitor activity across the website</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-4">Last 7 Days</h2>
          <div className="flex items-end justify-between gap-2 h-40">
            {stats?.daily.map((d) => (
              <div key={d.date} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <span className="text-[10px] text-gray-400 font-medium">{d.count}</span>
                <div
                  className="w-full rounded-t-md bg-brand-100 hover:bg-brand-200 transition-colors"
                  style={{ height: `${Math.max((d.count / maxDaily) * 100, 4)}%` }}
                  title={`${d.count} visits · ${d.unique} unique`}
                />
                <span className="text-[10px] text-gray-400 truncate w-full text-center">
                  {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-4">Top Pages (7 days)</h2>
          {stats && stats.topPages.length === 0 ? (
            <p className="text-gray-400 text-sm">No visits recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {stats?.topPages.map((p) => (
                <div key={p.path} className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs font-mono truncate flex-1">{p.path}</span>
                  <span className="text-sm font-bold text-gray-900">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by IP, page, or device..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">IP Address</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Page</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Device / Browser</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : visits.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No visits found</td></tr>
              ) : (
                visits.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{v.ip}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-brand-600">{v.path}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Monitor className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className="truncate max-w-[220px]">{v.userAgent || "—"}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
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
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / limit)}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">Previous</button>
            <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}