"use client";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { setItems } from "@/store/cartSlice";
import { useAuth } from "@/components/auth/AuthProvider";

export function CartSync() {
  const { user, loading } = useAuth();
  const dispatch = useDispatch();
  const items = useSelector((s: RootState) => s.cart.items);
  const hydrated = useRef(false);

  // Load the user's cart from the server when they log in.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      hydrated.current = false;
      return;
    }
    hydrated.current = false;
    fetch("/api/cart")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const serverItems = Array.isArray(data?.items) ? data.items : [];
        let merged: typeof items;
        if (serverItems.length > 0) {
          merged = serverItems;
        } else if (items.length > 0) {
          // First login: no saved cart yet — keep the guest's local items.
          merged = items;
        } else {
          merged = [];
        }
        dispatch(setItems(merged));
        hydrated.current = true;
      })
      .catch(() => {
        hydrated.current = true;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  // Save the cart to the server whenever it changes (only after hydration).
  useEffect(() => {
    if (loading || !user || !hydrated.current) return;
    fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  }, [items, loading, user]);

  return null;
}