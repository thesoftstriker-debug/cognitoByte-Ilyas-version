"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Plus, Trash2, Edit3, X, Upload, Loader2 } from "lucide-react";
import { PROJECT_CATEGORIES } from "@/lib/project-types";
import type { ProjectCategory } from "@/lib/project-types";

interface ProjectData {
  _id: string;
  title: string;
  slug: string;
  category: string;
  client: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  results: Array<{ metric: string; label: string }>;
  challenges: string;
  solution: string;
  tags: string[];
  publishedAt: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
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
    category: "" as ProjectCategory | "",
    client: "",
    shortDescription: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
    results: "",
    challenges: "",
    solution: "",
    tags: "",
    publishedAt: "",
    isActive: true,
  });
  const limit = 10;

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/projects?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProjects(data.projects);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const resetForm = () => {
    setForm({ title: "", slug: "", category: "", client: "", shortDescription: "", description: "", imageUrl: "", videoUrl: "", results: "", challenges: "", solution: "", tags: "", publishedAt: "", isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/projects/${id}`);
      if (!res.ok) throw new Error();
      const p = await res.json();
      setForm({
        title: p.title,
        slug: p.slug,
        category: p.category || "",
        client: p.client || "",
        shortDescription: p.shortDescription || "",
        description: p.description || "",
        imageUrl: p.imageUrl || "",
        videoUrl: p.videoUrl || "",
        results: (p.results || []).map((r: { metric: string; label: string }) => `${r.metric}||${r.label}`).join("\n"),
        challenges: p.challenges || "",
        solution: p.solution || "",
        tags: (p.tags || []).join(", "),
        publishedAt: p.publishedAt ? p.publishedAt.slice(0, 10) : "",
        isActive: p.isActive,
      });
      setEditingId(id);
      setShowForm(true);
    } catch {
      toast.error("Failed to load project");
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
        category: form.category || undefined,
        tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
        results: form.results.split("\n").map((line: string) => {
          const parts = line.split("||");
          return { metric: parts[0]?.trim() || "", label: parts[1]?.trim() || "" };
        }).filter((r: { metric: string }) => r.metric),
      };
      const url = editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects";
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
      toast.success(editingId ? "Project updated" : "Project created");
      resetForm();
      fetchProjects();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save project";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Project deleted");
      fetchProjects();
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all";
  const labelClass = "block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Projects</h1>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">Manage client case studies, videos, and portfolio items</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-xs py-2 px-4 sm:text-sm gap-2">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => resetForm()}>
          <div className="bg-[#0e111e] border border-white/15 text-white rounded-3xl p-6 sm:p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{editingId ? "Edit Project" : "New Project"}</h2>
              <button type="button" onClick={resetForm} className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input type="text" required value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value, slug: editingId ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Slug</label>
                  <input type="text" required value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ProjectCategory })}
                    className={`${inputClass} bg-[#11131f]`}>
                    <option value="" className="bg-gray-900 text-gray-400">Select category</option>
                    {PROJECT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-gray-900 text-white">{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Client Name</label>
                  <input type="text" value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Short Description</label>
                <textarea value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className={`${inputClass} resize-none`} rows={2} />
              </div>
              <div>
                <label className={labelClass}>Full Description</label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputClass} resize-none`} rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Image</label>
                  <div className="flex gap-2">
                    <input type="text" value={form.imageUrl} placeholder="URL or upload"
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      className={inputClass} />
                    <label className="btn-secondary text-sm py-2 px-3.5 cursor-pointer shrink-0">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <input type="file" accept="image/*" className="hidden" disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploading(true);
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            fd.append("folder", "projects");
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const data = await res.json();
                            if (data.url) setForm({ ...form, imageUrl: data.url });
                          } catch { toast.error("Upload failed"); }
                          finally { setUploading(false); }
                        }} />
                    </label>
                  </div>
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="" className="mt-2.5 h-20 rounded-xl object-cover border border-white/10" />
                  )}
                </div>
                <div>
                  <label className={labelClass}>Video URL</label>
                  <input type="text" value={form.videoUrl} placeholder="Direct video file or stream URL"
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className={inputClass} />
                  <p className="text-[11px] text-gray-400 mt-1">Direct video takes priority on detail card</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tags (comma separated)</label>
                  <input type="text" value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Published Date</label>
                  <input type="date" value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Results (metric||label per line)</label>
                <textarea value={form.results}
                  onChange={(e) => setForm({ ...form, results: e.target.value })}
                  placeholder="10x faster||Invoice Processing"
                  className={`${inputClass} resize-none`} rows={2} />
              </div>
              <div>
                <label className={labelClass}>Challenges</label>
                <textarea value={form.challenges}
                  onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                  className={`${inputClass} resize-none`} rows={2} />
              </div>
              <div>
                <label className={labelClass}>Solution</label>
                <textarea value={form.solution}
                  onChange={(e) => setForm({ ...form, solution: e.target.value })}
                  className={`${inputClass} resize-none`} rows={2} />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-white/20 bg-black/40 text-brand-500 focus:ring-brand-500 w-4 h-4" />
                <span className="text-sm font-medium text-gray-300">Active and visible to clients</span>
              </label>
              <div className="flex gap-3 pt-3">
                <button type="submit" className="btn-primary flex-1 justify-center text-sm py-2.5">{editingId ? "Update Project" : "Create Project"}</button>
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
          placeholder="Search projects..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder:text-gray-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all" />
      </div>

      <div className="bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-left">
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Title</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Category</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Client</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Tags</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Loading projects...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No projects found</td></tr>
              ) : (
                projects.map((p) => (
                  <tr key={p._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.imageUrl && (
                          <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                        )}
                        <span className="font-semibold text-white">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-brand-300 font-mono text-xs">{p.category}</td>
                    <td className="px-4 py-3.5 text-gray-300 text-xs">{p.client}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs">{(p.tags || []).join(", ")}</td>
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
