"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Users, Package, Wrench, Briefcase, FileText, Tag, Receipt } from "lucide-react";

const DEFAULT_STATS = { users: 0, services: 0, projects: 0, products: 0, blogs: 0, pricing: 0, orders: 0 };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load stats");
        return r.json();
      })
      .then((data) => {
        setCounts({
          users: data.users || 0,
          services: data.services || 0,
          projects: data.projects || 0,
          products: data.products || 0,
          blogs: data.blogs || 0,
          pricing: data.pricing || 0,
          orders: data.orders || 0,
        });
      })
      .catch(() => setCounts(DEFAULT_STATS))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Users", value: counts.users, icon: Users },
    { label: "Orders", value: counts.orders, icon: Receipt },
    { label: "Services", value: counts.services, icon: Wrench },
    { label: "Projects", value: counts.projects, icon: Briefcase },
    { label: "Products", value: counts.products, icon: Package },
    { label: "Blog Posts", value: counts.blogs, icon: FileText },
    { label: "Pricing Plans", value: counts.pricing, icon: Tag },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back, {user?.name}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">
                    {loading ? (
                      <span className="inline-block w-8 h-6 bg-gray-100 rounded animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
