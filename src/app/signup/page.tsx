"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import { Zap } from "lucide-react";

export default function SignupPage() {
  const { user, loading, signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signup(name, email, password);
      toast.success("Account created!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden bg-gradient-to-b from-gray-50/60 to-white">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-brand-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-6 hover:scale-105 transition-transform duration-200">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/25">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-950 font-black tracking-tight text-2xl">CognitoByte</span>
          </Link>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight">Create account</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Join CognitoByte to get instant access to digital assets</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 space-y-4 bg-white">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm"
              placeholder="At least 6 characters"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3.5 shadow-lg shadow-brand-500/25 cursor-pointer active:scale-98">
            {submitting ? "Creating account..." : "Create account"}
          </button>
          <p className="text-center text-sm text-gray-500 pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
