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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Products</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Manage digital products and assets</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-xs py-1.5 px-3 sm:text-sm sm:py-2 sm:px-4">
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4" onClick={() => resetForm()}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Edit Product" : "New Product"}</h2>
              <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                  <input
                    type="text" required value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price ($)</label>
                  <input
                    type="number" step="0.01" min="0" required value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select
                    required value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <img src={form.imageUrl} alt="" className="mt-2 h-20 rounded-lg object-cover border border-gray-200" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">File URL</label>
                  <div className="flex gap-2">
                    <input type="text" value={form.fileUrl} placeholder="URL or upload"
                      onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm" />
                    <label className="btn-secondary text-sm py-2 px-3 cursor-pointer shrink-0">
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-600">Active</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary text-sm py-2 px-4">
                  {editingId ? "Update" : "Create"}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary text-sm py-2 px-4">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Name</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Category</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Price</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Created</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products found</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imageUrl && (
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                        )}
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.category}</td>
                    <td className="px-4 py-3 font-mono">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <button onClick={() => handleEdit(p._id)} className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-500 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
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
