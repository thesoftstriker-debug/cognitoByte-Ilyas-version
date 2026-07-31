import Link from "next/link";
import { Linkedin, Mail, MapPin, Twitter, Github, Youtube } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

const SITE = {
  email: "automations@cognitobyte.com",
  location: "Islamabad, Pakistan",
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/hassan-khan-4a6a063b7/",
    twitter: "",
    github: "",
    youtube: "",
  },
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { socialLinks } = SITE;

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Logo variant="light" />
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              AI automation agency building n8n workflows, AI agents, and chatbots that save you hours every day.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {socialLinks?.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-500 flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-500 flex items-center justify-center transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-500 flex items-center justify-center transition-colors">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-500 flex items-center justify-center transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Services</h4>
            <ul className="space-y-2 text-sm">
              {["n8n Automations", "AI Agents", "Chatbot Building", "Workflow Design"].map((s) => (
                <li key={s}>
                  <Link href="/services" className="hover:text-white transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/about", label: "About" },
                { href: "/projects", label: "Projects" },
                { href: "/pricing", label: "Pricing" },
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-1.5 text-sm">
              {SITE.email && (
                <li className="flex items-start gap-1.5">
                  <Mail className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <a href={`mailto:${SITE.email}`} className="hover:text-white transition-colors break-words leading-tight">
                    {SITE.email}
                  </a>
                </li>
              )}
              {SITE.location && (
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{SITE.location}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© {currentYear} CognitoByte. All rights reserved.</p>
          <p className="text-gray-600">Built with Next.js · Sanity · MongoDB</p>
        </div>
      </div>
    </footer>
  );
}
