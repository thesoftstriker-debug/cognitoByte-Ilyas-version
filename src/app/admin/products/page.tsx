"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Plus, Trash2, Edit3, X, Upload, Loader2 } from "lucide-react";
import type { ProductCategory } from "@/lib/models/Product";

const CATEGORIES: ProductCategory[] = [
  "Marketing & Copywriting",
  "Content Creation",
  "Business & Product Building",
  "Creative & Visual Design",
];

interface ProductData {
  _id: string;
  name: string;
  slug: string;
  price: number;
  category: ProductCategory;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    category: "" as ProductCategory | "",
    imageUrl: "",
    fileUrl: "",
    isActive: true,
  });
  const limit = 10;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setForm({ name: "", slug: "", description: "", price: "", category: "", imageUrl: "", fileUrl: "", isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`);
      if (!res.ok) throw new Error();
      const p = await res.json();
      setForm({
        name: p.name,
        slug: p.slug,
        description: p.description || "",
        price: p.price.toString(),
        category: p.category,
        imageUrl: p.imageUrl || "",
        fileUrl: p.fileUrl || "",
        isActive: p.isActive,
      });
      setEditingId(id);
      setShowForm(true);
    } catch {
      toast.error("Failed to load product");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.price || !form.category) {
      toast.error("Name, slug, price, and category are required");
      return;
    }
    try {
      const body = { ...form, price: parseFloat(form.price) };
      const url = editingId
        ? `/api/admin/products/${editingId}`
        : "/api/admin/products";
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
      toast.success(editingId ? "Product updated" : "Product created");
      resetForm();
      fetchProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save product";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all";
  const labelClass = "block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Products</h1>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">Manage digital assets, templates, and downloadable tools</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-xs py-2 px-4 sm:text-sm gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => resetForm()}>
          <div className="bg-[#0e111e] border border-white/15 text-white rounded-3xl p-6 sm:p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{editingId ? "Edit Product" : "New Product"}</h2>
              <button type="button" onClick={resetForm} className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Slug</label>
                  <input
                    type="text" required value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputClass} resize-none`}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price ($)</label>
                  <input
                    type="number" step="0.01" min="0" required value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    required value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                    className={`${inputClass} bg-[#11131f]`}
                  >
                    <option value="" className="bg-gray-900 text-gray-400">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-gray-900 text-white">{cat}</option>
                    ))}
                  </select>
                </div>
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
                            fd.append("folder", "products");
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
                  <label className={labelClass}>Asset File Download URL</label>
                  <div className="flex gap-2">
                    <input type="text" value={form.fileUrl} placeholder="Direct file link or upload"
                      onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                      className={inputClass} />
                    <label className="btn-secondary text-sm py-2 px-3.5 cursor-pointer shrink-0">
                      {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <input type="file" className="hidden" disabled={uploadingFile}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingFile(true);
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            fd.append("folder", "products/files");
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const data = await res.json();
                            if (data.url) setForm({ ...form, fileUrl: data.url });
                          } catch { toast.error("Upload failed"); }
                          finally { setUploadingFile(false); }
                        }} />
                    </label>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-white/20 bg-black/40 text-brand-500 focus:ring-brand-500 w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-300">Active and available in marketplace</span>
              </label>
              <div className="flex gap-3 pt-3">
                <button type="submit" className="btn-primary flex-1 justify-center text-sm py-2.5">
                  {editingId ? "Update Product" : "Create Product"}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary text-sm py-2.5 px-5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder:text-gray-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all"
        />
      </div>

      <div className="bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-left">
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Name</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Category</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Price</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Created</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No products found</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.imageUrl && (
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                        )}
                        <span className="font-semibold text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs">{p.category}</td>
                    <td className="px-4 py-3.5 font-mono text-brand-300 font-bold">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${p.isActive ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-gray-800 text-gray-400 border-white/10"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs font-mono">
                      {new Date(p.createdAt).toLocaleDateString()}
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
