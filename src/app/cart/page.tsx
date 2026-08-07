"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, updateQuantity, clearCart } from "@/store/cartSlice";
import type { RootState } from "@/store/store";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ShoppingBag } from "lucide-react";

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
  };

  if (items.length === 0) {
    return (
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">
            Browse our digital assets and add something you like to your cart.
          </p>
          <Link href="/products" className="btn-primary">
            Browse Digital Assets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-brand-500" /> Your Cart
          </h1>
          <span className="text-sm text-gray-500">{count} {count === 1 ? "item" : "items"}</span>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="card p-4 flex items-center gap-4">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="font-semibold text-gray-900 hover:text-brand-600 truncate block">
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 font-mono">${item.price.toFixed(2)} each</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                <span className="font-bold font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                <button
                  onClick={() => dispatch(removeItem(item.productId))}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="text-xl font-bold font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Digital items are delivered instantly after checkout.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleCheckout} className="btn-primary text-xs py-2 px-4 justify-center">
              Proceed to Checkout
            </button>
            <button onClick={() => dispatch(clearCart())} className="btn-secondary text-xs py-2 px-4 justify-center">
              Clear Cart
            </button>
          </div>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mt-4">
            <ArrowLeft className="w-4 h-4" /> Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}