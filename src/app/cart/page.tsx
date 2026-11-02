"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, updateQuantity, clearCart } from "@/store/cartSlice";
import type { RootState } from "@/store/store";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ShoppingBag, Zap } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [whatsapp, setWhatsapp] = useState("");
  const items = useSelector((s: RootState) => s.cart.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    fetch("/api/orders/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.whatsapp && setWhatsapp(d.whatsapp))
      .catch(() => {});
  }, []);

  const handleCheckout = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/cart")}`);
      return;
    }
    const phone = whatsapp.replace(/[^0-9]/g, "");
    const orderItems = items
      .map((i, idx) => `${idx + 1}. ${i.name}\n      Qty: ${i.quantity}   Price: $${(i.price * i.quantity).toFixed(2)}`)
      .join("\n");
    const orderText = [
      "*NEW ORDER — CognitoByte*",
      "--------------------------------",
      orderItems,
      "--------------------------------",
      `*Total: $${subtotal.toFixed(2)}*`,
    ].join("\n");

    // Open WhatsApp synchronously (before any await) so popups aren't blocked.
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(orderText)}`, "_blank");
    } else {
      toast.error("WhatsApp number is not configured.");
    }

    // Send the order email in the background.
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then(async (res) => {
        if (res.ok) {
          toast.success("Order sent! We'll confirm on WhatsApp.");
        } else {
          const data = await res.json().catch(() => null);
          toast.error(data?.error || "Order email failed to send.");
        }
      })
      .catch(() => toast.error("Failed to send order. Please try again."));

    // Clear cart locally and sync with server
    dispatch(clearCart());
  };

  if (items.length === 0) {
    return (
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-[#08090f] text-white min-h-screen">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <ShoppingBag className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2 text-white">Your cart is empty</h1>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">
            Explore our enterprise digital assets, automation templates, and agent systems.
          </p>
          <Link href="/products" className="btn-primary">
            Browse Digital Assets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-[#08090f] text-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2 tracking-tight">
            <ShoppingCart className="w-6 h-6 text-brand-400" /> Your Shopping Cart
          </h1>
          <span className="text-xs sm:text-sm text-gray-400 font-medium">{count} {count === 1 ? "item" : "items"}</span>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-gray-900/80 border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-md hover:border-brand-500/30 transition-all shadow-lg"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-bold text-white hover:text-brand-300 truncate block transition-colors"
                >
                  {item.name}
                </Link>
                <p className="text-xs sm:text-sm text-brand-300 font-mono mt-0.5">${item.price.toFixed(2)} each</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                    className="p-1 rounded-md border border-white/10 hover:bg-white/10 text-gray-300 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs sm:text-sm font-semibold w-6 text-center text-white">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                    className="p-1 rounded-md border border-white/10 hover:bg-white/10 text-gray-300 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                <span className="font-bold font-mono text-white">${(item.price * item.quantity).toFixed(2)}</span>
                <button
                  onClick={() => dispatch(removeItem(item.productId))}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-6 mt-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Subtotal</span>
            <span className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-300">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
            <Zap className="w-3.5 h-3.5 text-brand-400" /> Digital assets are unlocked in your account instantly upon checkout.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleCheckout} className="btn-primary text-sm py-2.5 px-6 justify-center">
              Proceed to Checkout
            </button>
            <button onClick={() => dispatch(clearCart())} className="btn-secondary text-sm py-2.5 px-6 justify-center">
              Clear Cart
            </button>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
