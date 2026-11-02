"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, updateQuantity, clearCart } from "@/store/cartSlice";
import type { RootState } from "@/store/store";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, Check } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const items = useSelector((s: RootState) => s.cart.items);

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const rawSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (!isOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: rawSubtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDiscountAmount(data.discountAmount);
        setAppliedCode(data.code);
        toast.success(`Coupon ${data.code} applied! (-$${data.discountAmount.toFixed(2)})`);
      } else {
        toast.error(data.error || "Invalid coupon code");
      }
    } catch {
      toast.error("Failed to validate coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckout = () => {
    onClose();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/cart")}`);
      return;
    }
    router.push("/cart");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer — compact size for all screens */}
      <div className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col transform transition-transform duration-300 animate-slide-left border-l border-gray-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-b from-gray-50/80 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-gray-950 text-base leading-tight">Your Cart</h2>
              <span className="text-[11px] text-gray-500 font-medium">
                {totalCount} {totalCount === 1 ? "item" : "items"} selected
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Explore our digital assets and templates to get started.
            </p>
            <button onClick={onClose} className="btn-primary text-sm py-2.5 px-5">
              Browse Digital Assets
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.productId} className="pt-4 first:pt-0 flex gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={onClose}
                      className="font-medium text-sm text-gray-900 hover:text-brand-600 truncate block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      ${item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: item.productId,
                              quantity: item.quantity - 1,
                            })
                          )
                        }
                        className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: item.productId,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0">
                    <span className="font-bold text-sm font-mono text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => dispatch(removeItem(item.productId))}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
              {/* Coupon code form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon Code"
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50"
                >
                  {validatingCoupon ? "..." : "Apply"}
                </button>
              </form>

              {appliedCode && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <span className="flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Code: {appliedCode}
                  </span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">${rawSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="font-mono">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary justify-center text-sm py-2.5 gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex gap-2">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="flex-1 btn-secondary justify-center text-xs py-2"
                  >
                    View Full Cart
                  </Link>
                  <button
                    onClick={() => dispatch(clearCart())}
                    className="btn-ghost text-xs text-red-500 hover:bg-red-50 px-3"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
