import { Code2, Network, Palette, Workflow } from "lucide-react";

const TEAM = [
  {
    name: "Rasheed",
    role: "Networking Expert",
    bio: "Designs and secures the network and server infrastructure behind our client deployments.",
    icon: Network,
    accent: "from-cyan-400 to-blue-500",
    skills: ["Networking", "Infrastructure", "Security"],
  },
  {
    name: "Muhammad Ilyas",
    role: "Full-Stack Web App Developer",
    bio: "Ships production web applications with Next.js 14, React, the MERN stack, and TypeScript.",
    icon: Code2,
    accent: "from-brand-400 to-indigo-500",
    skills: ["Next.js 14", "React", "MERN"],
  },
  {
    name: "Hassan",
    role: "Automation Expert & Engineer",
    bio: "Builds n8n pipelines, AI agents, and API integrations that remove manual work for good.",
    icon: Workflow,
    accent: "from-violet-400 to-fuchsia-500",
    skills: ["n8n", "AI Agents", "APIs"],
  },
  {
    name: "Mudassir",
    role: "Graphic Designer",
    bio: "Crafts the brand identities, UI graphics, and visual assets used across our products.",
    icon: Palette,
    accent: "from-amber-400 to-orange-500",
    skills: ["Branding", "UI Design", "Graphics"],
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function TeamSection() {
  return (
    <section className="section-padding bg-[#090b14] border-y border-white/5">
      <div className="container-tight">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Our Team
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            The People Behind CognitoByte
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A small senior team covering engineering, automation, infrastructure, and design — so every project ships end to end.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member) => {
            const Icon = member.icon;
            return (
              <div
                key={member.name}
                className="group bg-gray-900/70 border border-white/10 rounded-2xl p-6 text-center hover:border-brand-500/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 backdrop-blur-md"
              >
                <div className="relative mx-auto mb-5 h-16 w-16">
                  <div
                    className={`flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br ${member.accent} text-xl font-black text-white shadow-lg`}
                  >
                    {initials(member.name)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#0d0f1a]">
                    <Icon className="h-3.5 w-3.5 text-brand-400" />
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white transition-colors group-hover:text-brand-300">
                  {member.name}
                </h3>
                <p className="mt-1 mb-3 text-xs font-semibold uppercase tracking-wider text-brand-300">
                  {member.role}
                </p>
                <p className="mb-5 text-sm leading-relaxed text-gray-400">{member.bio}</p>

                <div className="flex flex-wrap justify-center gap-2">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-gray-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
