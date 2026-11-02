"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  fileUrl?: string;
}

interface OrderData {
  _id: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled" | "delivered";
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Order status updated to ${status}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: status as any } : o))
      );
    } catch {
      toast.error("Failed to update order status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Customer Orders</h1>
        <p className="text-gray-400 mt-1 text-xs sm:text-sm">Manage customer orders, fulfillment, and status updates</p>
      </div>

      <div className="bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3.5">Order</th>
                <th className="px-4 py-3.5">Buyer</th>
                <th className="px-4 py-3.5">Items</th>
                <th className="px-4 py-3.5">Total</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No orders found</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-xs font-bold text-brand-300">#{o._id.slice(-6)}</div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{o.userName || "Customer"}</div>
                      <div className="text-xs text-gray-400 font-mono">{o.userEmail}</div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-300 text-xs">
                      {o.items.map((it, i) => (
                        <div key={i} className="line-clamp-1">
                          {it.name} <span className="text-brand-300 font-mono">× {it.quantity}</span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-black text-white">${o.total.toFixed(2)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                        o.status === "completed" || o.status === "delivered"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : o.status === "processing"
                          ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                          : o.status === "cancelled"
                          ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      }`}>
                        {o.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <select
                        value={o.status || "pending"}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className="text-xs py-1.5 px-2.5 rounded-lg border border-white/10 bg-black/60 text-white font-medium focus:ring-2 focus:ring-brand-500/30 outline-none"
                      >
                        <option value="pending" className="bg-gray-900 text-white">Pending</option>
                        <option value="processing" className="bg-gray-900 text-white">Processing</option>
                        <option value="completed" className="bg-gray-900 text-white">Completed</option>
                        <option value="cancelled" className="bg-gray-900 text-white">Cancelled</option>
                      </select>
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
