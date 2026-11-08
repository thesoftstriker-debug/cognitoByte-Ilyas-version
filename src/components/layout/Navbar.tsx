"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { STORAGE_KEY } from "@/store/store";
import { clearCart } from "@/store/cartSlice";
import { Menu, X, LogIn, ShoppingCart, LogOut, LayoutDashboard, Package } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { VisitCounter } from "@/components/layout/VisitCounter";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/products", label: "Digital Assets" },
  { href: "/projects", label: "Projects" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

interface NavbarProps {
  isCartOpen: boolean;
  onCartOpen: () => void;
}

export function Navbar({ isCartOpen, onCartOpen }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const dispatch = useDispatch();
  const cartCount = useSelector((s: RootState) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0));

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    dispatch(clearCart());
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    window.location.href = "/";
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;
    if (isOpen) {
      html.style.overflow = "hidden";
    } else {
      html.style.overflow = "";
    }
    return () => { html.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#08090f]/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/50 transition-all duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Logo — left col */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/" className="flex items-center hover:scale-105 transition-transform duration-200">
              <Logo variant="light" />
            </Link>
            <VisitCounter className="hidden md:inline-flex" />
          </div>

          {/* Desktop nav — truly centered col */}
          <div className="hidden lg:flex items-center justify-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 whitespace-nowrap",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-brand-300 bg-brand-500/20 border border-brand-500/30 shadow-[0_0_15px_rgba(79,110,247,0.3)]"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA — right col */}
          <div className="hidden lg:flex items-center justify-end gap-1.5">
            {loading ? null : user ? (
              <>
                {user.role !== "admin" && (
                  <Link href="/my-orders" className="btn-ghost text-xs py-1.5 px-3">
                    My Orders
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin" className="btn-ghost text-xs py-1.5 px-3">
                    Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-ghost text-xs py-1.5 px-3 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-ghost text-xs py-1.5 px-3">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            )}
            {user?.role !== "admin" && (
              <button
                onClick={onCartOpen}
                className="relative p-2 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/50 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            {user?.role !== "admin" && (
              <Link href="/contact" className="btn-primary text-xs py-2 px-4 shadow-md">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile right — cart, and for users logout/admin outside the hamburger */}
          <div className="flex lg:hidden items-center justify-end gap-1 col-start-3">
            {!loading && user?.role === "admin" && (
              <Link href="/admin" className="p-2 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white" aria-label="Dashboard">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}
            {!loading && user && (
              <button onClick={handleLogout} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10" aria-label="Logout">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            )}
            {user?.role !== "admin" && (
              <button
                onClick={onCartOpen}
                className="relative p-2 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            {!loading && !user && (
              <Link href="/login" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white" aria-label="Sign In">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </nav>
    </header>
    {isOpen && (
      <>
        <div className="fixed inset-0 top-16 z-40 lg:hidden bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <div className="fixed left-0 right-0 top-16 z-50 lg:hidden bg-[#08090f]/95 backdrop-blur-2xl border-b border-white/10 py-5 px-6 animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto flex flex-col items-start gap-1 shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3.5 py-2 rounded-xl text-sm font-medium transition-all w-full",
                pathname === link.href
                  ? "text-brand-300 bg-brand-500/20 border border-brand-500/30 font-semibold"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col items-start gap-2.5 border-t border-white/10 mt-2 w-full">
            <VisitCounter />
            {!loading && user && user.role !== "admin" && (
              <Link href="/my-orders" className="btn-ghost justify-center text-sm w-full border border-white/10">
                <Package className="w-4 h-4" /> My Orders
              </Link>
            )}
            {loading ? null : user ? null : (
              <Link href="/login" className="btn-ghost justify-center text-sm w-full border border-white/10">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            )}
            <Link href="/contact" className="btn-primary justify-center text-sm w-full">
              Get Started
            </Link>
          </div>
        </div>
      </>
    )}
    </>);
}
