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
    <section className="border-y border-brand-100/50 bg-gradient-to-r from-brand-50/60 via-white to-brand-50/60">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-brand-100/60">
          
          {data.map((stat, i) => (
            <div key={i} className="text-center py-4 sm:py-0 group">
              
              <p className="text-4xl sm:text-5xl font-bold text-brand-500 mb-2 transition-transform duration-300 group-hover:scale-110 inline-block">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
