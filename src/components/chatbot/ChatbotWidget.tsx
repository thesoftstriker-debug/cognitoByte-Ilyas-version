"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, ShieldCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import type { ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatbotWidget() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const welcomeMessage: ChatMessage = {
    role: "assistant",
    content: isAdmin
      ? "Hello Admin! 👋 I have full access to all live CognitoByte data. Ask me anything — revenue, top products, orders, users, coupons, or website content."
      : "Hi! I'm the CognitoByte AI assistant. I can answer questions about our web development projects, AI automations, chatbots, services, and pricing. How can I help you today?",
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
          "fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-w-md transition-all duration-300 origin-bottom-right",
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
          style={{ height: "70vh", maxHeight: "540px" }}
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
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3.5 scrollbar-thin">
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
                    "text-xs sm:text-sm rounded-2xl px-3.5 py-2.5 max-w-[88%] sm:max-w-[85%] leading-relaxed break-words",
                    msg.role === "user"
                      ? "bg-gradient-to-r from-brand-500 to-indigo-600 text-white rounded-br-xs shadow-md"
                      : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-xs"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose-chat text-gray-200">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children, ...props }) => {
                            const isExternal = href?.startsWith("http");
                            return (
                              <a
                                href={href}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="inline-flex items-center gap-0.5 text-brand-400 hover:text-brand-300 underline font-medium transition-colors"
                                {...props}
                              >
                                {children}
                                {isExternal && (
                                  <ExternalLink className="w-2.5 h-2.5 opacity-70 inline ml-0.5" />
                                )}
                              </a>
                            );
                          },
                          h1: ({ children }) => (
                            <h1 className="text-sm font-bold text-white mt-2.5 mb-1 pb-1 border-b border-white/10 flex items-center gap-1.5">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xs sm:text-sm font-bold text-brand-300 mt-2 mb-1">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-xs sm:text-sm font-semibold text-indigo-200 mt-2 mb-1">
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider mt-1.5 mb-0.5">
                              {children}
                            </h4>
                          ),
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0 leading-relaxed text-gray-200 text-xs sm:text-[13px]">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 space-y-1 my-1.5 text-gray-200 text-xs sm:text-[13px]">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 space-y-1 my-1.5 text-gray-200 text-xs sm:text-[13px]">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-relaxed">
                              {children}
                            </li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-white">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-gray-300">
                              {children}
                            </em>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-brand-500/80 bg-white/5 pl-2.5 py-1 my-2 rounded-r italic text-gray-300 text-xs">
                              {children}
                            </blockquote>
                          ),
                          code: ({ className, children, ...props }: any) => {
                            const isInline = !className;
                            if (isInline) {
                              return (
                                <code
                                  className="bg-black/50 text-brand-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-white/10"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <code
                                className="block bg-black/70 p-2.5 rounded-xl text-[11px] font-mono text-gray-200 overflow-x-auto border border-white/10 my-2 shadow-inner"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-2.5 rounded-xl border border-white/15 bg-black/40 shadow-md">
                              <table className="min-w-full divide-y divide-white/10 text-left text-[11px]">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-white/10 text-white font-semibold">
                              {children}
                            </thead>
                          ),
                          tbody: ({ children }) => (
                            <tbody className="divide-y divide-white/5">
                              {children}
                            </tbody>
                          ),
                          tr: ({ children }) => (
                            <tr className="hover:bg-white/5 transition-colors">
                              {children}
                            </tr>
                          ),
                          th: ({ children }) => (
                            <th className="px-2.5 py-2 text-left font-semibold text-brand-300 uppercase tracking-wider text-[10px] whitespace-nowrap">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-2.5 py-1.5 text-gray-200 align-top leading-snug">
                              {children}
                            </td>
                          ),
                          hr: () => <hr className="border-white/10 my-2.5" />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
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
