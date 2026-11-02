"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Tag, Plus, Trash2, CheckCircle2, XCircle, X } from "lucide-react";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (res.ok) {
        setCoupons(data.coupons || []);
      }
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      toast.error("Code and discount value are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Coupon created successfully!");
        setShowModal(false);
        setCode("");
        setDiscountValue("");
        setMinOrderAmount("");
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to create coupon");
      }
    } catch {
      toast.error("Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Coupon deleted");
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      }
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all";
  const labelClass = "block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-brand-400" /> Coupon & Promo Codes
          </h1>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">
            Create discount promo codes for customer checkout checkout recovery
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs py-2 px-4 sm:text-sm gap-2"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-12 text-center text-gray-400">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-12 text-center text-gray-400">
          <Tag className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="font-bold text-white text-base">No active coupons</p>
          <p className="text-xs text-gray-500 mt-1">Click &quot;Create Coupon&quot; to add your first promo code.</p>
        </div>
      ) : (
        <div className="bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min. Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-300">
                      {coupon.code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% OFF`
                        : `$${coupon.discountValue.toFixed(2)} OFF`}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 font-mono text-xs">
                      {coupon.minOrderAmount ? `$${coupon.minOrderAmount.toFixed(2)}` : "None"}
                    </td>
                    <td className="py-3.5 px-4">
                      {coupon.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                          <XCircle className="w-3.5 h-3.5" /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e111e] border border-white/15 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">New Promo Coupon</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className={labelClass}>
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className={`${inputClass} bg-[#11131f]`}
                  >
                    <option value="percentage" className="bg-gray-900 text-white">Percentage (%)</option>
                    <option value="fixed" className="bg-gray-900 text-white">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="20"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Min Order Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Optional min total"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-xs py-2.5 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs py-2.5 px-5"
                >
                  {saving ? "Saving..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
