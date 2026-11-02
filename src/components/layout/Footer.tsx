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
    <footer className="relative bg-gray-950 text-gray-400 border-t border-gray-900 overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[150px] bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center mb-4 transition-transform hover:scale-105 duration-200">
              <Logo variant="light" />
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-6 max-w-sm">
              AI automation agency building n8n workflows, custom AI agents, and intelligent chatbots that save you hundreds of hours every month.
            </p>
            <div className="flex items-center gap-2.5">
              {socialLinks?.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-brand-600 hover:border-brand-500 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-brand-600 hover:border-brand-500 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-brand-600 hover:border-brand-500 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {socialLinks?.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-brand-600 hover:border-brand-500 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase text-xs">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {["n8n Automations", "AI Agents", "Chatbot Building", "Workflow Design"].map((s) => (
                <li key={s}>
                  <Link href="/services" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">{s}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase text-xs">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/about", label: "About" },
                { href: "/projects", label: "Projects" },
                { href: "/pricing", label: "Pricing" },
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase text-xs">Contact</h4>
            <ul className="space-y-3 text-sm">
              {SITE.email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <a href={`mailto:${SITE.email}`} className="hover:text-white transition-colors break-words leading-tight">
                    {SITE.email}
                  </a>
                </li>
              )}
              {SITE.location && (
                <li className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{SITE.location}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} CognitoByte. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Built with precision & high-performance modern tech</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
