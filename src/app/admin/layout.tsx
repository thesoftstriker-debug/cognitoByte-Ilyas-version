"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Package, Briefcase, Wrench, FileText, Tag, LogOut, ChevronLeft, Zap, Receipt, Eye } from "lucide-react";

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
      <div className="min-h-screen bg-[#08090f] flex items-center justify-center pt-16">
        <div className="animate-spin w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className={cn("bg-[#08090f] text-white pt-16 flex min-h-screen", !collapsed && "h-screen overflow-hidden")}>
      {!collapsed && (
        <div className="fixed inset-0 top-16 bg-black/60 z-20 md:hidden backdrop-blur-xs" onClick={() => setCollapsed(true)} />
      )}
      <aside
        className={cn(
          "bg-[#0c0e1a]/95 border-r border-white/10 backdrop-blur-2xl transition-all duration-200 z-30 flex flex-col overflow-hidden text-white shadow-2xl",
          "fixed left-0 top-16 bottom-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {!collapsed && (
            <span className="font-bold text-xs text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Admin Portal
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  isActive
                    ? "text-white bg-gradient-to-r from-brand-500/25 to-indigo-500/25 border border-brand-500/40 shadow-sm shadow-brand-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                title={collapsed ? link.label : undefined}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-brand-300" : "text-gray-400")} />
                {!collapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-white/10">
          <Link
            href="/admin/visits"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1",
              pathname === "/admin/visits"
                ? "text-white bg-gradient-to-r from-brand-500/25 to-indigo-500/25 border border-brand-500/40 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
            title="Visits"
          >
            <Eye className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="truncate">Visits</span>}
          </Link>
          {!collapsed && (
            <div className="px-3 py-2 text-xs text-gray-400 truncate font-mono">{user.email}</div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>
      <main className={cn("flex-1 min-w-0 transition-all duration-200 p-6 sm:p-8 overflow-y-auto h-full bg-[#08090f] text-white", collapsed && "ml-16", !collapsed && "ml-60")}>
        {children}
      </main>
    </div>
  );
}
