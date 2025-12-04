import { Users, UserPlus, Rocket, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Team Restructuring",
    description: "Evaluate current team dynamics before restructuring to make data-driven decisions about new team compositions.",
  },
  {
    icon: UserPlus,
    title: "New Team Integration",
    description: "Help new team members understand existing team culture and identify areas for smooth integration.",
  },
  {
    icon: Rocket,
    title: "New Project Kickoff",
    description: "Assess team readiness before starting a new project and address potential collaboration gaps early.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Improvement",
    description: "Run regular health checks to track team progress and celebrate improvements over time.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="about" className="py-20 gradient-hero">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What can Team Health Check do for your company?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Discover how our diagnostic tool helps teams at every stage of their journey
          </p>
        </div>


        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div 
              key={benefit.title}
              className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
