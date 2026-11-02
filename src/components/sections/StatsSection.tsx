interface Props {
  stats?: Array<{ value: string; label: string }>;
}
const DEFAULT_STATS = [
  { value: "50+", label: "Automations Built" },
  { value: "10x", label: "Average Time Saved" },
  { value: "100%", label: "Client Satisfaction" },
];
export function StatsSection({ stats }: Props) {
  const data = stats?.length ? stats : DEFAULT_STATS;
  return (
    <section className="relative border-y border-white/10 bg-[#0c0e1a]/90 backdrop-blur-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-purple-600/10 to-brand-600/10 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {data.map((stat, i) => (
            <div key={i} className="text-center py-4 sm:py-0 group">
              <p className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-white via-brand-200 to-brand-400 bg-clip-text text-transparent mb-2 transition-transform duration-300 group-hover:scale-110 inline-block drop-shadow-[0_0_20px_rgba(79,110,247,0.35)]">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest group-hover:text-brand-300 transition-colors">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
