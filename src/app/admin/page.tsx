"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Users, Package, DollarSign, ShoppingBag, Tag, ArrowRight, Clock } from "lucide-react";

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
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back, {user?.name || "Admin"}</p>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-5 shadow-xl border border-brand-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-100 uppercase font-semibold">Total Revenue</p>
              <p className="text-2xl font-black font-mono mt-1 text-white">
                ${loading ? "..." : (stats?.totalRevenue || 0).toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-xl hover:border-brand-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Total Orders</p>
              <p className="text-2xl font-black text-white mt-1">
                {loading ? "..." : stats?.totalOrders || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-xl hover:border-brand-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Pending Orders</p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {loading ? "..." : stats?.pendingOrders || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-xl hover:border-brand-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Total Users</p>
              <p className="text-2xl font-black text-white mt-1">
                {loading ? "..." : stats?.totalUsers || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/admin/orders" className="bg-gray-900/80 border border-white/10 rounded-2xl p-4 hover:border-brand-500/40 hover:bg-gray-900/90 transition-all flex items-center justify-between group shadow-lg backdrop-blur-md">
          <span className="font-semibold text-sm text-white group-hover:text-brand-300 transition-colors">Manage Orders</span>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-300 transition-colors" />
        </Link>
        <Link href="/admin/products" className="bg-gray-900/80 border border-white/10 rounded-2xl p-4 hover:border-brand-500/40 hover:bg-gray-900/90 transition-all flex items-center justify-between group shadow-lg backdrop-blur-md">
          <span className="font-semibold text-sm text-white group-hover:text-brand-300 transition-colors">Digital Products</span>
          <Package className="w-4 h-4 text-gray-400 group-hover:text-brand-300 transition-colors" />
        </Link>
        <Link href="/admin/coupons" className="bg-gray-900/80 border border-white/10 rounded-2xl p-4 hover:border-brand-500/40 hover:bg-gray-900/90 transition-all flex items-center justify-between group shadow-lg backdrop-blur-md">
          <span className="font-semibold text-sm text-white group-hover:text-brand-300 transition-colors">Coupons & Promos</span>
          <Tag className="w-4 h-4 text-gray-400 group-hover:text-brand-300 transition-colors" />
        </Link>
        <Link href="/admin/users" className="bg-gray-900/80 border border-white/10 rounded-2xl p-4 hover:border-brand-500/40 hover:bg-gray-900/90 transition-all flex items-center justify-between group shadow-lg backdrop-blur-md">
          <span className="font-semibold text-sm text-white group-hover:text-brand-300 transition-colors">User Accounts</span>
          <Users className="w-4 h-4 text-gray-400 group-hover:text-brand-300 transition-colors" />
        </Link>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Customer Orders</h2>
          <Link href="/admin/orders" className="text-xs text-brand-300 hover:text-white font-semibold transition-colors">
            View All Orders &rarr;
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading recent orders...</p>
        ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No recent orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 uppercase">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-brand-300">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="py-2.5 px-3 text-white font-medium">
                      {order.userName || order.userEmail || "Customer"}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-white">
                      ${(order.total || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        order.status === "completed" || order.status === "delivered"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/20"
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
