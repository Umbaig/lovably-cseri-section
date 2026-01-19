import { ArrowRight, Users, Zap, Shield, Eye, BarChart3, AlertTriangle, Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  { number: "1", title: "Set team size and invite participants" },
  { number: "2", title: "Team members complete a short, anonymous check" },
  { number: "3", title: "Get a clear, aggregated team summary with focus areas" },
];

const trustPoints = [
  { icon: Shield, text: "Answers are anonymous" },
  { icon: Eye, text: "No individual results" },
  { icon: BarChart3, text: "Results shown only in aggregate" },
];

const HeroSection = () => {
  return (
    <section className="relative">
      {/* Hero */}
      <div className="gradient-hero pt-28 pb-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
              See the Real Health of Your Team — Before Problems Escalate
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              A fast, anonymous team check that reveals risks, misalignment, and improvement opportunities in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/diagnostics">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform w-full sm:w-auto"
                >
                  Start a Team Check
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/quick-test">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Try Quick Test
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/managers#preview">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                >
                  See a Sample Report
                  <Eye className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Process */}
      <div className="bg-background py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <p className="text-foreground font-medium">{step.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust & Safety */}
      <div className="bg-muted/50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {trustPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-3">
                <point.icon className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground font-medium">{point.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Output Preview */}
      <div className="bg-background py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What You'll Get</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Team Health Score</h3>
              <p className="text-muted-foreground text-sm">Clear maturity ratings across key team dimensions like ownership, collaboration, and delivery.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Risk Areas</h3>
              <p className="text-muted-foreground text-sm">Highlighted gaps and potential blockers that need attention before they escalate.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Improvement Focus</h3>
              <p className="text-muted-foreground text-sm">Actionable recommendations to guide your next steps and team conversations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audience Split */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link to="/managers" className="group">
              <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors h-full">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-xl">For Managers</h3>
                </div>
                <p className="text-muted-foreground">Early risk visibility and decision support. Spot team issues before they impact delivery.</p>
                <span className="inline-flex items-center text-primary font-medium mt-4 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              </div>
            </Link>
            <Link to="/scrum-masters" className="group">
              <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors h-full">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-xl">For Scrum Masters & Teams</h3>
                </div>
                <p className="text-muted-foreground">Better retrospectives and continuous improvement. Make impediments visible and track progress.</p>
                <span className="inline-flex items-center text-primary font-medium mt-4 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-6">
            Ready to see how your team is really doing?
          </h2>
          <Link to="/diagnostics">
            <Button 
              size="lg" 
              variant="secondary"
              className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform"
            >
              Start a Team Check
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
