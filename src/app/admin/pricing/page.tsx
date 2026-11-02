"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Plus, Trash2, Edit3, X } from "lucide-react";

interface PlanData {
  _id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
  ctaText: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    period: "",
    description: "",
    features: "",
    isPopular: false,
    ctaText: "Get Started",
    order: "0",
    isActive: true,
  });
  const limit = 10;

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/pricing?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPlans(data.pricing);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load pricing plans");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const resetForm = () => {
    setForm({ name: "", price: "", period: "", description: "", features: "", isPopular: false, ctaText: "Get Started", order: "0", isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/pricing/${id}`);
      if (!res.ok) throw new Error();
      const p = await res.json();
      setForm({
        name: p.name,
        price: p.price,
        period: p.period || "",
        description: p.description || "",
        features: (p.features || []).join("\n"),
        isPopular: p.isPopular,
        ctaText: p.ctaText || "Get Started",
        order: p.order?.toString() || "0",
        isActive: p.isActive,
      });
      setEditingId(id);
      setShowForm(true);
    } catch {
      toast.error("Failed to load pricing plan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    try {
      const body = {
        ...form,
        order: parseInt(form.order) || 0,
        features: form.features.split("\n").map((f: string) => f.trim()).filter(Boolean),
      };
      const url = editingId ? `/api/admin/pricing/${editingId}` : "/api/admin/pricing";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      toast.success(editingId ? "Plan updated" : "Plan created");
      resetForm();
      fetchPlans();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save plan";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pricing plan?")) return;
    try {
      const res = await fetch(`/api/admin/pricing/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Plan deleted");
      fetchPlans();
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all";
  const labelClass = "block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Pricing Plans</h1>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">Manage tiers and package offerings displayed on pricing page</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-xs py-2 px-4 sm:text-sm gap-2">
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => resetForm()}>
          <div className="bg-[#0e111e] border border-white/15 text-white rounded-3xl p-6 sm:p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{editingId ? "Edit Plan" : "New Plan"}</h2>
              <button type="button" onClick={resetForm} className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Order</label>
                  <input type="number" min="0" value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price</label>
                  <input type="text" required value={form.price} placeholder="$299 or Custom"
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Period</label>
                  <input type="text" value={form.period} placeholder="one-time or /month"
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Button Text</label>
                  <input type="text" value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    className={inputClass} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.isPopular}
                      onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                      className="rounded border-white/20 bg-black/40 text-brand-500 focus:ring-brand-500 w-4 h-4" />
                    <span className="text-sm font-medium text-gray-300">Highlight as Most Popular</span>
                  </label>
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputClass} resize-none`} rows={2} />
              </div>
              <div>
                <label className={labelClass}>Features (one per line)</label>
                <textarea value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className={`${inputClass} resize-none`} rows={4} />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-white/20 bg-black/40 text-brand-500 focus:ring-brand-500 w-4 h-4" />
                <span className="text-sm font-medium text-gray-300">Active and visible to customers</span>
              </label>
              <div className="flex gap-3 pt-3">
                <button type="submit" className="btn-primary flex-1 justify-center text-sm py-2.5">{editingId ? "Update Plan" : "Create Plan"}</button>
                <button type="button" onClick={resetForm} className="btn-secondary text-sm py-2.5 px-5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search plans..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder:text-gray-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all" />
      </div>

      <div className="bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-left">
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Order</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Name</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Price</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Features</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Loading pricing plans...</td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No pricing plans found</td></tr>
              ) : (
                plans.map((p) => (
                  <tr key={p._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">{p.order}</td>
                    <td className="px-4 py-3.5 font-semibold text-white">
                      {p.name}
                      {p.isPopular && <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">Popular</span>}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-brand-300 font-bold">{p.price}{p.period ? ` / ${p.period}` : ""}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs">{p.features?.length || 0} features</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${p.isActive ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-gray-800 text-gray-400 border-white/10"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 flex items-center gap-1.5">
                      <button onClick={() => handleEdit(p._id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
