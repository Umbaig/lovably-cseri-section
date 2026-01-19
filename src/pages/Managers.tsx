import { ArrowRight, Eye, Users, TrendingUp, AlertTriangle, Target, MessageSquare, Calendar, UserPlus, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

const sampleRadarData = [
  { category: "Delivery", score: 3.8, fullMark: 5 },
  { category: "Ownership", score: 4.2, fullMark: 5 },
  { category: "Communication", score: 3.5, fullMark: 5 },
  { category: "Trust", score: 3.2, fullMark: 5 },
  { category: "Value", score: 4.0, fullMark: 5 },
  { category: "Leadership", score: 3.6, fullMark: 5 },
];

const whyColumns = [
  {
    title: "Their Reality",
    icon: AlertTriangle,
    items: [
      "I don't know what's really going on in the team",
      "Issues surface too late",
      "Retrospectives feel subjective"
    ]
  },
  {
    title: "TeamCheck Shows",
    icon: Eye,
    items: [
      "Engagement and ownership gaps",
      "Process and collaboration risks",
      "Maturity trends over time"
    ]
  },
  {
    title: "So They Can",
    icon: Target,
    items: [
      "Intervene early",
      "Make informed decisions",
      "Lead fact-based conversations"
    ]
  }
];

const useCases = [
  { icon: Calendar, text: "Before quarterly planning" },
  { icon: UserPlus, text: "After team changes or growth" },
  { icon: Clock, text: "When delivery slows down" },
  { icon: MessageSquare, text: "To prepare for retrospectives or 1:1s" }
];

const sampleRisks = [
  { category: "Trust & Safety", score: 3.2, status: "At Risk" },
  { category: "Communication", score: 3.5, status: "Needs Attention" }
];

const Managers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] gradient-hero flex items-center justify-center pt-20">
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
              See the Real Health of Your Team — Before Problems Escalate
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              A fast, data-driven team check that reveals risks, misalignment, and growth areas in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/diagnostics">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform"
                >
                  Run a Free Team Check
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#output-preview">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-6 text-lg font-semibold rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  See a Sample Report
                  <Eye className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Managers Use TeamCheck */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Managers Use TeamCheck
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {whyColumns.map((column, idx) => (
              <div key={idx} className="bg-card rounded-2xl p-8 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <column.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{column.title}</h3>
                </div>
                <ul className="space-y-4">
                  {column.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Managers Use TeamCheck */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How Managers Use TeamCheck
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase, idx) => (
              <div key={idx} className="bg-card rounded-xl p-6 border border-border text-center hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                  <useCase.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">{useCase.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Output Preview */}
      <section id="output-preview" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Output Preview
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            See what insights you'll get from a single team check
          </p>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Sample Radar */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Team Maturity Score
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={sampleRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickCount={6} />
                    <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4">
                <span className="text-3xl font-bold text-primary">3.7</span>
                <span className="text-muted-foreground ml-2">/ 5.0</span>
              </div>
            </div>

            {/* Key Risks */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Key Risks Identified
              </h3>
              <div className="space-y-4">
                {sampleRisks.map((risk, idx) => (
                  <div key={idx} className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{risk.category}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        risk.status === "At Risk" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {risk.status}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${risk.status === "At Risk" ? "bg-red-500" : "bg-amber-500"}`}
                        style={{ width: `${(risk.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{risk.score} / 5.0</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Recommendation */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Sample Recommendation
              </h3>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                  Trust & Psychological Safety
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  "Schedule a dedicated session to discuss what makes team members feel safe to share concerns. Consider introducing anonymous feedback channels for sensitive topics."
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Full reports include 6+ category-specific recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTAs */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to See Your Team's Real Health?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Takes less than 5 minutes. No signup required for the free check.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/diagnostics">
              <Button 
                size="lg" 
                variant="secondary"
                className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform"
              >
                Run a Free Team Check
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/#contact">
              <Button 
                size="lg" 
                variant="outlinePrimary"
                className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform"
              >
                Talk to Us
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-primary-foreground/60 mt-4">
            For larger teams or organizations
          </p>
        </div>
      </section>
    </div>
  );
};

export default Managers;
