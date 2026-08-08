"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Package, Briefcase, Wrench, FileText, Tag, LogOut, ChevronLeft, Zap, Receipt } from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/projects", label: "Projects", icon: Briefcase },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/blogs", label: "Blog", icon: FileText },
  { href: "/admin/pricing", label: "Pricing", icon: Zap },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className={cn("bg-gray-50 pt-16 flex", !collapsed && "h-screen overflow-hidden")}>
      {!collapsed && (
        <div className="fixed inset-0 top-16 bg-black/20 z-20 md:hidden" onClick={() => setCollapsed(true)} />
      )}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-200 z-30 flex flex-col overflow-hidden",
          "fixed left-0 top-16 bottom-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          {!collapsed && <span className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Admin</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-brand-600 bg-brand-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
                title={collapsed ? link.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-gray-100">
          {!collapsed && (
            <div className="px-3 py-2 text-xs text-gray-400 truncate">{user.email}</div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>
      <main className={cn("flex-1 min-w-0 transition-all duration-200 p-6 overflow-y-auto h-full", collapsed && "ml-16", !collapsed && "ml-60")}>
        {children}
      </main>
    </div>
  );
}
