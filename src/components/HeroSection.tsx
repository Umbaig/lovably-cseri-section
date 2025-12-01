import { ArrowRight } from "lucide-react";
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
            Know your team maturity level
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            It is eye opening to get an overview of your teams strong and weak sides to take needed actions
          </p>
          
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link to="/diagnostics">
              <Button 
                size="lg" 
                variant="secondary"
                className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform"
              >
                Take the Test
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
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
