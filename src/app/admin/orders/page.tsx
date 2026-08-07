"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  _id: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "delivered";
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
      setOrders(data.orders);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const markDelivered = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Order marked as delivered");
      fetchOrders();
    } catch {
      toast.error("Failed to update order");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Orders</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Manage customer orders</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Order</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Buyer</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Items</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Total</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No orders yet</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-500">#{o._id.slice(-6)}</div>
                      <div className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.userName || "—"}</div>
                      <div className="text-xs text-gray-500">{o.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {o.items.map((it, i) => (
                        <div key={i}>{it.name} × {it.quantity}</div>
                      ))}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">${o.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.status === "delivered" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                        {o.status === "delivered" ? "Delivered" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {o.status !== "delivered" && (
                        <button onClick={() => markDelivered(o._id)} className="btn-primary text-xs py-1.5 px-3">
                          Mark Delivered
                        </button>
                      )}
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