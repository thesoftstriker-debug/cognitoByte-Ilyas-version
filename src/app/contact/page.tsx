import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
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
    <div className="pt-16">
      <section className="relative section-padding bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-50/80 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-2">
              <div className="label-tag mb-4">Get In Touch</div>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-950 mb-4 leading-tight tracking-tight">
                Let&apos;s build something great
              </h1>
              <p className="text-gray-500 leading-relaxed mb-8 text-base">
                Tell us about your automation needs. We&apos;ll get back to you
                within 24 hours with a tailored plan.
              </p>
              <div className="space-y-4">
                {SITE.email && (
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                      <a href={`mailto:${SITE.email}`}
                        className="text-gray-900 hover:text-brand-600 transition-colors font-semibold text-sm">
                        {SITE.email}
                      </a>
                    </div>
                  </div>
                )}
                {SITE.location && (
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Location</p>
                      <p className="text-gray-900 font-semibold text-sm">{SITE.location}</p>
                      <p className="text-gray-400 text-xs">Working globally & remotely</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Response Time</p>
                    <p className="text-gray-900 font-semibold text-sm">Within 24 hours</p>
                    <p className="text-gray-400 text-xs">Mon–Sat, 9am–6pm PKT</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-6 bg-gradient-to-br from-brand-50 to-indigo-50/50 rounded-3xl border border-brand-100/80 shadow-sm">
                <p className="text-brand-700 font-bold text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500" /> Free Discovery Call
                </p>
                <p className="text-brand-900/70 text-sm leading-relaxed">
                  Not sure what to automate first? Book a free 30-min call.
                  We&apos;ll map out exactly what would save you the most time.
                </p>
              </div>
            </div>
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
