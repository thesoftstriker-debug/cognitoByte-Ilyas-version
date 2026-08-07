"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Download, Package, ShoppingBag } from "lucide-react";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  fileUrl?: string;
  slug?: string;
}

interface OrderData {
  _id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "delivered";
  createdAt: string;
}

export default function MyOrdersPage() {
  const { loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders/mine")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setOrders(d?.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (authLoading || loading) {
    return (
      <div className="pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">No orders yet</h1>
          <p className="text-gray-500 mb-6">When you buy a digital asset, your orders will appear here.</p>
          <Link href="/products" className="btn-primary">Browse Digital Assets</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-6 h-6 text-brand-500" />
          <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-400">
                  Order #{order._id.slice(-6)} · {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.status === "delivered" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                  {order.status === "delivered" ? "Delivered" : "Pending"}
                </span>
              </div>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty {item.quantity} · ${item.price.toFixed(2)}</p>
                    </div>
                    {order.status === "delivered" ? (
                      item.fileUrl ? (
                        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-1.5 px-3 shrink-0">
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 shrink-0">No file</span>
                      )
                    ) : (
                      <span className="text-xs text-gray-400 shrink-0">Awaiting delivery</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <span className="text-sm text-gray-500">Total: </span>
                <span className="text-base font-bold font-mono ml-2">${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}