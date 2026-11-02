import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Operations Director",
    company: "TechFlow Co.",
    quote:
      "CognitoByte saved us 20+ hours a week. Our invoice processing went from a 2-day manual nightmare to a fully automated, same-day system. Incredible work.",
    rating: 5,
  },
  {
    name: "Ahmed Hassan",
    role: "Founder",
    company: "GrowthLab",
    quote:
      "The AI agent they built handles our lead qualification end-to-end. It's like having a tireless team member who never makes mistakes. ROI was positive in week one.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "CEO",
    company: "Ecom Ventures",
    quote:
      "We went from manually replying to 100+ support tickets a day to an AI chatbot handling 80% of them automatically. The team at CognitoByte really understood our needs.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-gray-950">
      <div className="container-tight">
        <div className="text-center mb-12">
          <div className="label-tag mb-4 mx-auto w-fit bg-gray-800 border-gray-700 text-brand-400">Testimonials</div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            CLIENTS LOVE THE RESULTS
          </h2>
          <p className="text-gray-400 text-lg">
            Don&apos;t just take our word for it.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-7 flex flex-col hover:border-brand-500/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, ri) => (
                  <Star key={ri} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 italic flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">
                    {t.role}{t.company ? `, ${t.company}` : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
