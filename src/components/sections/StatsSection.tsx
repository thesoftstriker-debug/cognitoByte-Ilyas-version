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
    <section className="border-y border-gray-100 bg-gray-50">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          
          {data.map((stat, i) => (
            <div key={i} className="text-center">
              
              <p className="text-4xl sm:text-5xl font-bold text-brand-500 mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
