import { ArrowRight, Shield, Users, Eye, Target, CheckCircle, AlertTriangle, TrendingUp, Calendar, RefreshCw, Shuffle, Award, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const sampleRadarData = [
  { category: "Delivery", score: 3.2, fullMark: 5 },
  { category: "Ownership", score: 2.8, fullMark: 5 },
  { category: "Communication", score: 3.5, fullMark: 5 },
  { category: "Trust", score: 3.0, fullMark: 5 },
  { category: "Value", score: 2.5, fullMark: 5 },
  { category: "Leadership", score: 3.3, fullMark: 5 },
];

const ScrumMasters = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] gradient-hero flex items-center justify-center pt-20">
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Users className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm text-primary-foreground font-medium">For Scrum Masters & Practitioners</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Make Team Problems Visible — and Fix Them Together
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
              A short, safe team check that helps Scrum Masters spot impediments, align the team, and drive meaningful improvement.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/diagnostics">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform w-full sm:w-auto"
                >
                  Start the Team Check
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-6 text-lg font-semibold rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
                >
                  How It Works
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-12 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Anonymous Answers</p>
                <p className="text-sm text-muted-foreground">Individual responses stay private</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">No Individual Scores</p>
                <p className="text-sm text-muted-foreground">Only team-level insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Improvement Focused</p>
                <p className="text-sm text-muted-foreground">Not evaluation or judgment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Scrum Masters Use TeamCheck - 3 Column */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Why Scrum Masters Use TeamCheck
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From hidden problems to visible improvement
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Column 1: Common Pain */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Common Pain</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-destructive mt-1">•</span>
                  Hidden impediments
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-destructive mt-1">•</span>
                  Low engagement in retrospectives
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-destructive mt-1">•</span>
                  Same issues repeating sprint after sprint
                </li>
              </ul>
            </div>

            {/* Column 2: TeamCheck Reveals */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">TeamCheck Reveals</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  Collaboration and ownership gaps
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  Process and flow blockers
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  Team maturity signals over time
                </li>
              </ul>
            </div>

            {/* Column 3: So Scrum Masters Can */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="w-12 h-12 rounded-full bg-chart-2/20 flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">So Scrum Masters Can</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <ArrowRight className="h-4 w-4 text-chart-2 mt-1 flex-shrink-0" />
                  Facilitate focused retrospectives
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <ArrowRight className="h-4 w-4 text-chart-2 mt-1 flex-shrink-0" />
                  Address real impediments
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <ArrowRight className="h-4 w-4 text-chart-2 mt-1 flex-shrink-0" />
                  Track improvement sprint by sprint
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How Scrum Masters Use TeamCheck */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            How Scrum Masters Use TeamCheck
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Integrate team health checks into your agile practice
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Before Retrospectives</h3>
              <p className="text-sm text-muted-foreground">Get data to guide discussions</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">When Improvement Stalls</h3>
              <p className="text-sm text-muted-foreground">Identify what's really blocking progress</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shuffle className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">After Team Changes</h3>
              <p className="text-sm text-muted-foreground">Re-baseline after scope or roster shifts</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">To Validate Coaching</h3>
              <p className="text-sm text-muted-foreground">Measure if interventions are working</p>
            </div>
          </div>
        </div>
      </section>

      {/* Output Preview Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            What You'll See
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Actionable insights to guide your team's improvement
          </p>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Sample Radar */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Team Health View</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={sampleRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="category" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 5]} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <Radar
                      name="Team Score"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Visual maturity across 6 dimensions
              </p>
            </div>

            {/* Highlighted Impediments */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Highlighted Impediments</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Ownership Gaps</p>
                    <p className="text-xs text-muted-foreground">Score: 2.8 — Needs attention</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-chart-5/10 rounded-lg border border-chart-5/30">
                  <AlertTriangle className="h-5 w-5 text-chart-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Value Alignment</p>
                    <p className="text-xs text-muted-foreground">Score: 2.5 — Priority blocker</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border">
                  <Eye className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Trust Building</p>
                    <p className="text-xs text-muted-foreground">Score: 3.0 — Room to grow</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Improvement Focus */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Improvement Focus</h3>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="font-medium text-foreground text-sm mb-2">Suggested Retro Topic</p>
                  <p className="text-sm text-muted-foreground">
                    "How might we improve ownership hand-offs between team members?"
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <p className="font-medium text-foreground text-sm mb-2">Quick Win</p>
                  <p className="text-sm text-muted-foreground">
                    Introduce a 2-minute ownership check at the end of each sprint planning.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <p className="font-medium text-foreground text-sm mb-2">Track Over Time</p>
                  <p className="text-sm text-muted-foreground">
                    Run the check again in 2-3 sprints to measure progress.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Make Team Problems Visible?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Start with a free team check and see what your team really needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/diagnostics">
              <Button 
                size="lg" 
                variant="secondary"
                className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform"
              >
                Start the Team Check
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/managers">
              <Button 
                size="lg" 
                variant="outlinePrimary"
                className="px-8 py-6 text-lg font-semibold rounded-full hover:scale-105 transition-transform"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Invite Your Manager
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrumMasters;
