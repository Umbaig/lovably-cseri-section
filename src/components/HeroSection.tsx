import { ArrowRight, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { value: "200+", label: "Teams Assessed" },
  { value: "50+", label: "Organizations" },
  { value: "36", label: "Diagnostic Questions" },
  { value: "95%", label: "Find It Valuable" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] gradient-hero flex items-center justify-center pt-20">
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
            Know your Teams
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            A quick team health check for managers who want to spot problems early, without long surveys.
          </p>
          
          {/* Two Path Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/managers">
              <Button 
                size="lg" 
                variant="secondary"
                className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform w-full sm:w-auto"
              >
                <Users className="mr-2 h-5 w-5" />
                For Managers & Team Leads
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/scrum-masters">
              <Button 
                size="lg" 
                variant="secondary"
                className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform w-full sm:w-auto"
              >
                <Zap className="mr-2 h-5 w-5" />
                For Scrum Masters & Teams
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-primary-foreground/60 mt-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Ideal for small tech and project teams of 5–20 people
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="stat-card rounded-2xl p-6 animate-fade-in"
              style={{ animationDelay: `${0.6 + index * 0.1}s` }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-primary-foreground/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
