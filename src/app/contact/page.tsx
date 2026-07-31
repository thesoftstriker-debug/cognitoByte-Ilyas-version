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
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="label-tag mb-4">Get In Touch</div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-950 mb-4 leading-tight">
                Let&apos;s build something great
              </h1>
              <p className="text-gray-500 leading-relaxed mb-8">
                Tell us about your automation needs. We&apos;ll get back to you
                within 24 hours with a plan.
              </p>
              <div className="space-y-5">
                {SITE.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-brand-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                      <a href={`mailto:${SITE.email}`}
                        className="text-gray-800 hover:text-brand-500 transition-colors font-medium">
                        {SITE.email}
                      </a>
                    </div>
                  </div>
                )}
                {SITE.location && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-brand-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Location</p>
                      <p className="text-gray-800 font-medium">{SITE.location}</p>
                      <p className="text-gray-500 text-sm">Working globally, remotely</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Response Time</p>
                    <p className="text-gray-800 font-medium">Within 24 hours</p>
                    <p className="text-gray-500 text-sm">Mon–Sat, 9am–6pm PKT</p>
                  </div>
                </div>
              </div>
              <div className="mt-10 p-5 bg-brand-50 rounded-2xl border border-brand-100">
                <p className="text-brand-700 font-semibold text-sm mb-1">Free Discovery Call</p>
                <p className="text-brand-600 text-sm">
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
