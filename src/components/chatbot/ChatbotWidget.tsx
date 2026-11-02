"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import type { ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";

export function ChatbotWidget() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const welcomeMessage: ChatMessage = {
    role: "assistant",
    content: isAdmin
      ? "Hello Admin! 👋 I have full access to all live CognitoByte data. Ask me anything — revenue, top products, orders, users, coupons, or website content."
      : "Hi! I'm the CognitoByte AI assistant. I can answer questions about our services, pricing, and process. How can I help you today?",
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I ran into an issue. Please try again or email us directly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-84 max-w-sm transition-all duration-300 origin-bottom-right",
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none",
        )}
      >
        <div
          className={cn(
            "rounded-3xl shadow-2xl border flex flex-col overflow-hidden backdrop-blur-2xl transition-all duration-300 bg-[#0c0e1a]/95 text-white",
            isAdmin
              ? "border-indigo-500/30 shadow-indigo-500/20"
              : "border-white/10 shadow-brand-500/20"
          )}
          style={{ height: "65vh", maxHeight: "490px" }}
        >
          {/* Header */}
          <div
            className={cn(
              "px-4 py-3 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10",
              isAdmin
                ? "bg-gradient-to-r from-indigo-700 via-indigo-600 to-brand-700"
                : "bg-gradient-to-r from-brand-600 to-indigo-600"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-xs">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <p className="text-white font-bold text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                  {isAdmin ? "Admin Intelligence" : "CognitoByte AI"}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </p>
                <p className="text-white/80 text-[10px]">
                  {isAdmin ? "Full live DB query access" : "Replies in <1 second"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-all p-1.5 rounded-lg hover:bg-white/15 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 scrollbar-thin">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {msg.role === "assistant" && (
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-auto mr-2 mb-0.5 border",
                      isAdmin
                        ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                        : "bg-brand-500/20 border-brand-500/30 text-brand-300"
                    )}
                  >
                    {isAdmin ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      <Bot className="w-3 h-3" />
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "text-xs sm:text-sm rounded-2xl px-3.5 py-2.5 max-w-[85%] leading-relaxed",
                    msg.role === "user"
                      ? "bg-gradient-to-r from-brand-500 to-indigo-600 text-white rounded-br-xs shadow-md"
                      : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-xs"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose-chat text-gray-200 space-y-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mr-2 mb-0.5 border",
                    isAdmin
                      ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                      : "bg-brand-500/20 border-brand-500/30 text-brand-300"
                  )}
                >
                  {isAdmin ? (
                    <ShieldCheck className="w-3 h-3" />
                  ) : (
                    <Bot className="w-3 h-3" />
                  )}
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-xs px-3.5 py-2.5 flex items-center gap-1.5 text-xs text-gray-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  <span>{isAdmin ? "Querying database..." : "Thinking..."}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-2 sm:p-3 shrink-0 bg-white/5">
            <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-black/40 border border-white/10">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isAdmin ? "Ask about revenue, orders, products..." : "Ask me anything..."
                }
                className="flex-1 bg-transparent text-xs sm:text-sm outline-none text-white placeholder:text-gray-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  input.trim() && !isLoading
                    ? "bg-gradient-to-r from-brand-500 to-indigo-600 text-white hover:brightness-110 shadow-sm"
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
                )}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-center text-gray-500 text-[10px] mt-1.5">
              {isAdmin
                ? "🔒 Admin mode · Live system context"
                : "Powered by Groq LPU · Specialized CognitoByte Assistant"}
            </p>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group border border-white/15",
          isOpen
            ? "bg-gray-900 text-white"
            : isAdmin
            ? "bg-gradient-to-br from-indigo-600 via-indigo-500 to-brand-600 text-white shadow-indigo-500/40"
            : "bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 text-white shadow-brand-500/40"
        )}
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white transition-transform duration-200 group-hover:rotate-90" />
        ) : isAdmin ? (
          <ShieldCheck className="w-5 h-5 text-white transition-transform duration-200 group-hover:scale-110" />
        ) : (
          <MessageCircle className="w-5 h-5 text-white transition-transform duration-200 group-hover:scale-110" />
        )}
        {/* Pulse ring */}
        {!isOpen && (
          <span
            className={cn(
              "absolute inset-0 rounded-full animate-ping opacity-30 pointer-events-none",
              isAdmin ? "bg-indigo-400" : "bg-brand-400"
            )}
          />
        )}
      </button>
    </>
  );
}
