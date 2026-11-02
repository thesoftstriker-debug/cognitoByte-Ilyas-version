import type { Metadata } from "next";
import { Mail, MapPin, Clock, Sparkles } from "lucide-react";
import { ContactForm } from "./ContactForm";

const SITE = {
  email: "automations@cognitobyte.com",
  location: "Islamabad, Pakistan",
};

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with CognitoByte. Book a free discovery call or send us a message.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="pt-20 bg-[#08090f] text-white min-h-screen">
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Glow ambient spots */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Left Info Column */}
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Get In Touch</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
                Let&apos;s build something intelligent
              </h1>
              <p className="text-gray-400 leading-relaxed mb-8 text-base">
                Tell us about your automation bottlenecks. We&apos;ll get back to you within 24 hours with a custom blueprint.
              </p>

              <div className="space-y-4">
                {SITE.email && (
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-900/60 border border-white/10 hover:border-brand-500/40 hover:bg-gray-900/90 transition-all backdrop-blur-md">
                    <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                      <a
                        href={`mailto:${SITE.email}`}
                        className="text-white hover:text-brand-300 transition-colors font-semibold text-sm"
                      >
                        {SITE.email}
                      </a>
                    </div>
                  </div>
                )}

                {SITE.location && (
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-900/60 border border-white/10 hover:border-brand-500/40 hover:bg-gray-900/90 transition-all backdrop-blur-md">
                    <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Location</p>
                      <p className="text-white font-semibold text-sm">{SITE.location}</p>
                      <p className="text-gray-500 text-xs">Working globally & remotely</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-900/60 border border-white/10 hover:border-brand-500/40 hover:bg-gray-900/90 transition-all backdrop-blur-md">
                  <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Response Time</p>
                    <p className="text-white font-semibold text-sm">Within 24 hours guaranteed</p>
                    <p className="text-gray-500 text-xs">Mon–Sat, 9am–6pm PKT</p>
                  </div>
                </div>
              </div>

              {/* Free discovery call pill */}
              <div className="mt-8 p-6 bg-gradient-to-br from-brand-950/60 via-gray-900/60 to-indigo-950/60 rounded-3xl border border-brand-500/20 shadow-xl backdrop-blur-md">
                <p className="text-brand-300 font-bold text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Free Discovery Call
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Not sure what to automate first? Book a free 30-min call. We&apos;ll audit your operational flow and map out your maximum ROI wins.
                </p>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
