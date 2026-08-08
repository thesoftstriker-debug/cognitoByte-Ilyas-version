"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Tag, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-7 h-7 text-brand-600" /> Coupon & Promo Codes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create discount codes for customer checkouts.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-sm py-2 px-4 gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-500">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-semibold">No active coupons</p>
          <p className="text-xs mt-1">Click &quot;Create Coupon&quot; to add your first promo code.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min. Order</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-brand-600">
                      {coupon.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% OFF`
                        : `$${coupon.discountValue.toFixed(2)} OFF`}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {coupon.minOrderAmount ? `$${coupon.minOrderAmount.toFixed(2)}` : "None"}
                    </td>
                    <td className="py-3 px-4">
                      {coupon.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-fade-in space-y-4">
            <h3 className="text-xl font-bold text-gray-900">New Promo Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="20"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">
                  Min Order Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Optional min total"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs py-2 px-4"
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
