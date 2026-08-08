"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

export function AppShell() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Navbar isCartOpen={isCartOpen} onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {/* Hide chatbot when cart drawer is open to avoid overlap */}
      {!isCartOpen && <ChatbotWidget />}
    </>
  );
}
