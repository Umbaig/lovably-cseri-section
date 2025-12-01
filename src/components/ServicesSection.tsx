import { Sparkles, Target, Gauge, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  {
    icon: Sparkles,
    title: "Team Transformation",
    description: "Transform your teams with proven agile methodologies and collaborative frameworks that deliver results.",
    features: ["Scrum Implementation", "Team Coaching", "Culture Change"],
  },
  {
    icon: Target,
    title: "Strategic Planning",
    description: "Align your business objectives with agile practices to achieve sustainable growth and competitive advantage.",
    features: ["Product Roadmapping", "OKR Implementation", "Agile Governance"],
  },
  {
    icon: Gauge,
    title: "Performance Optimization",
    description: "Optimize your delivery processes and accelerate time-to-market with data-driven improvements.",
    features: ["Metrics & Analytics", "Process Improvement", "Continuous Delivery"],
  },
  {
    icon: Lightbulb,
    title: "Tailored Team Workshop",
    description: "Empower your team with a workshop customized to address your unique challenges and deliver measurable results.",
    features: [
      "Facilitation focused on your main problem areas",
      "Targeted activities to boost engagement",
      "Actionable strategies for implementation",
      "Team feedback and clear next steps",
    ],
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Services That Drive Results
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive agile consulting services designed to transform your organization and accelerate growth
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <Card 
              key={service.title}
              className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
