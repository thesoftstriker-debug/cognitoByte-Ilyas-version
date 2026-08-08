"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Users, Package, DollarSign, ShoppingBag, Tag, ArrowRight, Clock, CheckCircle } from "lucide-react";

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          setStats(data.stats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.name || "Admin"}</p>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5 bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-100 uppercase font-semibold">Total Revenue</p>
              <p className="text-2xl font-extrabold font-mono mt-1">
                ${loading ? "..." : (stats?.totalRevenue || 0).toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "..." : stats?.totalOrders || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Pending Orders</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {loading ? "..." : stats?.pendingOrders || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "..." : stats?.totalUsers || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/admin/orders" className="card p-4 hover:border-brand-500 transition-colors flex items-center justify-between group">
          <span className="font-semibold text-sm text-gray-800">Manage Orders</span>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
        </Link>
        <Link href="/admin/products" className="card p-4 hover:border-brand-500 transition-colors flex items-center justify-between group">
          <span className="font-semibold text-sm text-gray-800">Digital Products</span>
          <Package className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
        </Link>
        <Link href="/admin/coupons" className="card p-4 hover:border-brand-500 transition-colors flex items-center justify-between group">
          <span className="font-semibold text-sm text-gray-800">Coupons & Promos</span>
          <Tag className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
        </Link>
        <Link href="/admin/users" className="card p-4 hover:border-brand-500 transition-colors flex items-center justify-between group">
          <span className="font-semibold text-sm text-gray-800">User Accounts</span>
          <Users className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
        </Link>
      </div>

      {/* Recent Orders Overview */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Customer Orders</h2>
          <Link href="/admin/orders" className="text-xs text-brand-600 hover:underline font-semibold">
            View All Orders &rarr;
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading recent orders...</p>
        ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No recent orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-brand-600">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="py-2.5 px-3 text-gray-900 font-medium">
                      {order.userName || order.userEmail || "Customer"}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold">
                      ${(order.total || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        order.status === "completed" || order.status === "delivered"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {order.status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
