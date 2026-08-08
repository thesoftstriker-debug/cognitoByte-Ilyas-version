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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Customer Orders</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Manage customer orders and status updates</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No orders found</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-bold text-brand-600">#{o._id.slice(-6)}</div>
                      <div className="text-[11px] text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{o.userName || "Customer"}</div>
                      <div className="text-xs text-gray-500">{o.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {o.items.map((it, i) => (
                        <div key={i} className="line-clamp-1">
                          {it.name} × {it.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">${o.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        o.status === "completed" || o.status === "delivered"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : o.status === "processing"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : o.status === "cancelled"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {o.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={o.status || "pending"}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className="text-xs py-1.5 px-2 rounded-lg border border-gray-200 bg-white font-medium focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
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