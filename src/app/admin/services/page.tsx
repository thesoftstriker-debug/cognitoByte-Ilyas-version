"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Plus, Trash2, Edit3, X, Upload, Loader2 } from "lucide-react";

interface ServiceData {
  _id: string;
  title: string;
  slug: string;
  order: number;
  icon: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  features: string[];
  process: Array<{ step: string; title: string; description: string }>;
  isActive: boolean;
  createdAt: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    order: "0",
    icon: "Zap",
    shortDescription: "",
    description: "",
    imageUrl: "",
    features: "",
    process: "",
    isActive: true,
  });
  const limit = 10;

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/services?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setServices(data.services);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const resetForm = () => {
    setForm({ title: "", slug: "", order: "0", icon: "Zap", shortDescription: "", description: "", imageUrl: "", features: "", process: "", isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/services/${id}`);
      if (!res.ok) throw new Error();
      const s = await res.json();
      setForm({
        title: s.title,
        slug: s.slug,
        order: s.order?.toString() || "0",
        icon: s.icon || "Zap",
        shortDescription: s.shortDescription || "",
        description: s.description || "",
        imageUrl: s.imageUrl || "",
        features: (s.features || []).join("\n"),
        process: (s.process || []).map((p: { step: string; title: string; description: string }) => `${p.step}||${p.title}||${p.description}`).join("\n"),
        isActive: s.isActive,
      });
      setEditingId(id);
      setShowForm(true);
    } catch {
      toast.error("Failed to load service");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) {
      toast.error("Title and slug are required");
      return;
    }
    try {
      const body = {
        ...form,
        order: parseInt(form.order) || 0,
        features: form.features.split("\n").map((f: string) => f.trim()).filter(Boolean),
        process: form.process.split("\n").map((line: string) => {
          const parts = line.split("||");
          return { step: parts[0]?.trim() || "", title: parts[1]?.trim() || "", description: parts[2]?.trim() || "" };
        }).filter((p: { step: string }) => p.step),
      };
      const url = editingId ? `/api/admin/services/${editingId}` : "/api/admin/services";
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
      toast.success(editingId ? "Service updated" : "Service created");
      resetForm();
      fetchServices();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save service";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Service deleted");
      fetchServices();
    } catch {
      toast.error("Failed to delete service");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Services</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Manage services and offerings</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-xs py-1.5 px-3 sm:text-sm sm:py-2 sm:px-4">
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add Service
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4" onClick={() => resetForm()}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Edit Service" : "New Service"}</h2>
              <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input type="text" required value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value, slug: editingId ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                  <input type="text" required value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                  <input type="number" min="0" value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                  <input type="text" value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Short Description</label>
                <textarea value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm resize-none" rows={2} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Description</label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
                <div className="flex gap-2">
                  <input type="text" value={form.imageUrl} placeholder="URL or upload"
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm" />
                  <label className="btn-secondary text-sm py-2 px-3 cursor-pointer shrink-0">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <input type="file" accept="image/*" className="hidden" disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const fd = new FormData();
                          fd.append("file", file);
                          fd.append("folder", "services");
                          const res = await fetch("/api/upload", { method: "POST", body: fd });
                          const data = await res.json();
                          if (data.url) setForm({ ...form, imageUrl: data.url });
                        } catch { toast.error("Upload failed"); }
                        finally { setUploading(false); }
                      }} />
                  </label>
                </div>
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="" className="mt-2 h-20 rounded-lg object-cover border border-gray-200" />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Features (one per line)</label>
                <textarea value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Process steps (step||title||description per line)</label>
                <textarea value={form.process}
                  onChange={(e) => setForm({ ...form, process: e.target.value })}
                  placeholder="1||Discovery||Understand your business needs"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm resize-none" rows={3} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                <span className="text-sm text-gray-600">Active</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary text-sm py-2 px-4">{editingId ? "Update" : "Create"}</button>
                <button type="button" onClick={resetForm} className="btn-secondary text-sm py-2 px-4">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search services..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Order</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Title</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Icon</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Features</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No services found</td></tr>
              ) : (
                services.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.order}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.imageUrl && (
                          <img src={s.imageUrl} alt={s.title} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                        )}
                        <span className="font-medium">{s.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.icon}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.features?.length || 0} features</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <button onClick={() => handleEdit(s._id)} className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-500 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
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
