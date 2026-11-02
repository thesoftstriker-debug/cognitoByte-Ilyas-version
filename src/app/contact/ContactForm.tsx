"use client";
import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
type FormState = "idle" | "loading" | "success" | "error";
const SERVICE_OPTIONS = [
  "n8n Automation",
  "AI Agent",
  "Chatbot Building",
  "Workflow Design",
  "Not sure yet",
];
const BUDGET_OPTIONS = [
  "Under $500",
  "$500 – $1,000",
  "$1,000 – $3,000",
  "$3,000+",
  "Let's discuss",
];
export function ContactForm() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    budget: "",
    message: "",
  });
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setFormState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setFormState("success");
      toast.success("Message sent! We'll reply within 24 hours.");
    } catch (err) {
      setFormState("error");
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to send. Please try again.",
      );
    }
  }
  if (formState === "success") {
    return (
      <div className="card p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
        
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Message Received!
        </h3>
        <p className="text-gray-500 max-w-sm">
          
          Thanks for reaching out. We&apos;ll review your project and get back
          to you within 24 hours.
        </p>
      </div>
    );
  }
  const inputClass =
    "w-full bg-gray-50/70 border border-gray-200/90 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 focus:bg-white transition-all duration-200";
  const labelClass =
    "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2";
  return (
    <div className="card p-8 sm:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 bg-white">
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          <div>
            
            <label className={labelClass}>
              Name <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              className={inputClass}
              required
            />
          </div>
          <div>
            
            <label className={labelClass}>
              Email <span className="text-red-400">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className={inputClass}
              required
            />
          </div>
        </div>
        <div>
          
          <label className={labelClass}>Company</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Your company name (optional)"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          <div>
            
            <label className={labelClass}>Service Needed</label>
            <select
              name="service"
              value={form.service}
              onChange={handleChange}
              className={inputClass}
            >
              
              <option value="">Select a service</option>
              {SERVICE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            
            <label className={labelClass}>Budget Range</label>
            <select
              name="budget"
              value={form.budget}
              onChange={handleChange}
              className={inputClass}
            >
              
              <option value="">Select budget</option>
              {BUDGET_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          
          <label className={labelClass}>
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us about your project. What repetitive tasks are slowing you down?"
            rows={5}
            className={cn(inputClass, "resize-none")}
            required
          />
        </div>
        {formState === "error" && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
            
            <AlertCircle className="w-4 h-4 shrink-0" /> Something went wrong.
            Please try again or email us directly.
          </div>
        )}
        <button
          type="submit"
          disabled={formState === "loading"}
          className="btn-primary w-full justify-center py-4 text-base font-bold shadow-lg shadow-brand-500/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer active:scale-98"
        >
          
          {formState === "loading" ? (
            <>
              
              <Loader2 className="w-5 h-5 animate-spin" /> Sending...
            </>
          ) : (
            <>
              
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" /> Send Message
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400">
          
          We respond within 24 hours. Your info is never shared.
        </p>
      </form>
    </div>
  );
}
