import { Users, AlertTriangle, TrendingUp } from "lucide-react";
import trafficLightImage from "@/assets/traffic-light.png";

const benefits = [
  {
    icon: AlertTriangle,
    title: "Spot Issues Early",
    description: "Identify team problems before they escalate. Get early warnings about morale, collaboration, and engagement.",
  },
  {
    icon: Users,
    title: "Understand Your Team",
    description: "See how your team really feels about their work, communication, and environment in minutes.",
  },
  {
    icon: TrendingUp,
    title: "Take Action",
    description: "Get clear insights and recommendations to improve team dynamics and performance.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="about" className="py-20 gradient-hero relative overflow-hidden">
      {/* Traffic Light Background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
        <div className="w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden border-8 border-white/20">
          <img 
            src={trafficLightImage} 
            alt="Traffic light" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What can Team Health Check do for your company?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Discover how our diagnostic tool helps teams at every stage of their journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
