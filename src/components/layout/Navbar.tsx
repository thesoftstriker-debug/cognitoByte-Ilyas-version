"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Menu, X, LogIn, ShoppingCart, LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/products", label: "Digital Assets" },
  { href: "/projects", label: "Projects" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const cartCount = useSelector((s: RootState) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0));

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Logo — left col */}
          <Link href="/" className="flex items-center">
            <Logo variant="dark" />
          </Link>

          {/* Desktop nav — truly centered col */}
          <div className="hidden lg:flex items-center justify-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-brand-600 bg-brand-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                {user.role === "admin" && (
                  <Link href="/admin" className="btn-ghost text-xs py-1.5 px-3">
                    Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-ghost text-xs py-1.5 px-3 text-red-500 hover:bg-red-50">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-ghost text-xs py-1.5 px-3">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            )}
            <Link href="/cart" className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/contact" className="btn-primary text-xs py-2 px-4">
              Get Started
            </Link>
          </div>

          {/* Mobile right — cart, and for users logout/admin outside the hamburger */}
          <div className="flex lg:hidden items-center justify-end gap-0.5 col-start-3">
            {!loading && user?.role === "admin" && (
              <Link href="/admin" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900" aria-label="Dashboard">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}
            {!loading && user && (
              <button onClick={handleLogout} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50" aria-label="Logout">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            )}
            <Link href="/cart" className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {!loading && !user && (
              <Link href="/login" className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900" aria-label="Sign In">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
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
        <div className="fixed inset-0 top-16 z-40 md:hidden" onClick={() => setIsOpen(false)} />
        <div className="fixed left-0 right-0 top-16 z-50 lg:hidden bg-white border-b border-gray-100 py-4 px-6 animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto flex flex-col items-start gap-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors w-auto",
                pathname === link.href
                  ? "text-brand-600 bg-brand-50"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col items-start gap-2 border-t border-gray-100 mt-2">
            {loading ? null : user ? null : (
              <Link href="/login" className="btn-ghost justify-center text-sm">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            )}
            <Link href="/contact" className="btn-primary justify-center text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </>
    )}
    </>);
}
