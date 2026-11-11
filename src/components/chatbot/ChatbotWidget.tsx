"use client";
import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Loader2,
  ShieldCheck,
  ExternalLink,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatbotWidget() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [isOpen, setIsOpen] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const initialGreeting = isAdmin
    ? "Hello Admin! 👋 I am your CognitoByte assistant powered by Grok. You can ask me to search projects, check services, or analyze our system."
    : "Hi! 👋 I'm the CognitoByte AI assistant. Ask me anything about our custom chatbots, n8n automations, AI agents, or full-stack web development!";

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
  } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome-message",
        role: "assistant",
        content: initialGreeting,
      },
    ],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim() || leadSubmitting) return;

    setLeadSubmitting(true);
    try {
      const res = await fetch("/api/chat/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          note: "Lead submitted through chatbot contact step",
        }),
      });

      if (res.ok) {
        setLeadSuccess(true);
        setTimeout(() => {
          setShowLeadModal(false);
          setLeadSuccess(false);
          setLeadName("");
          setLeadEmail("");
        }, 2200);
      }
    } catch (err) {
      console.error("Lead submission error:", err);
    } finally {
      setLeadSubmitting(false);
    }
  }

  return (
    <>
      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-20 sm:bottom-24 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[420px] max-w-md transition-all duration-300 origin-bottom-right",
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none"
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
                  {isAdmin ? "Live Grok Database Search" : "Powered by Grok · Live Project Search"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowLeadModal(true)}
                title="Leave your contact info"
                className="text-white/80 hover:text-white transition-all p-1.5 rounded-lg hover:bg-white/15 active:scale-95 text-xs flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Connect</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-all p-1.5 rounded-lg hover:bg-white/15 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3.5 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
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
                            <li className="leading-relaxed">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-white">
                              {children}
                            </strong>
                          ),
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
                  <Bot className="w-3 h-3" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-xs px-3.5 py-2.5 flex items-center gap-1.5 text-xs text-gray-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  <span>Searching database & generating response...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error.message || "Something went wrong."}</span>
                </div>
                <button
                  onClick={() => reload()}
                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-[10px] text-white font-medium"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Lead Capture Overlay */}
          {showLeadModal && (
            <div className="absolute inset-x-0 bottom-0 bg-[#0e1122]/98 border-t border-white/15 p-4 z-20 backdrop-blur-md animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                  Connect With CognitoByte Team
                </p>
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {leadSuccess ? (
                <div className="py-3 text-center text-xs text-emerald-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Thanks! We will reach out within 24 hours.
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-gray-500 outline-none focus:border-brand-500"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-gray-500 outline-none focus:border-brand-500"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowLeadModal(false)}
                      className="px-2.5 py-1 text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={leadSubmitting}
                      className="btn-primary text-xs py-1 px-3"
                    >
                      {leadSubmitting ? "Saving..." : "Submit"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/10 p-2 sm:p-3 shrink-0 bg-white/5">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-black/40 border border-white/10"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder={
                  isAdmin
                    ? "Ask Grok to search projects or services..."
                    : "Ask about WordPress, WhatsApp bots, Next.js..."
                }
                className="flex-1 bg-transparent text-xs sm:text-sm outline-none text-white placeholder:text-gray-500"
                disabled={isLoading}
              />
              <button
                type="submit"
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
            </form>
            <p className="text-center text-gray-500 text-[10px] mt-1.5">
              Powered by Grok (xAI) · Database-Grounded Assistant
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
