import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Mail, CheckCircle, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import teamHealthLogo from "@/assets/teamhealth-logo.png";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const questions = [
  { id: 1, text: "Our team usually completes the work we planned.", category: "delivery" },
  { id: 2, text: "Unplanned tasks do not significantly disrupt our sprint or iteration.", category: "delivery" },
  { id: 3, text: "We have clear priorities and stick to them.", category: "delivery" },
  { id: 4, text: "Dependencies are managed effectively and rarely block progress.", category: "delivery" },
  { id: 5, text: "We limit our work in progress and avoid spreading ourselves thin.", category: "delivery" },
  { id: 6, text: "We regularly deliver meaningful, visible progress.", category: "delivery" },
  { id: 7, text: "Team members proactively help each other when needed.", category: "ownership" },
  { id: 8, text: "Work ownership is clear, and individuals follow through.", category: "ownership" },
  { id: 9, text: "The team holds itself accountable for results, not just individuals.", category: "ownership" },
  { id: 10, text: "Workload is shared fairly across the team.", category: "ownership" },
  { id: 11, text: "Issues or blockers are raised quickly and openly.", category: "ownership" },
  { id: 12, text: "The team solves problems together instead of assigning blame.", category: "ownership" },
  { id: 13, text: "Our meetings are productive and have high engagement.", category: "communication" },
  { id: 14, text: "Important decisions are shared clearly with the team.", category: "communication" },
  { id: 15, text: "We discuss and align on expectations before starting work.", category: "communication" },
  { id: 16, text: "Hand-offs between roles (Dev, QA, PO, etc.) are smooth.", category: "communication" },
  { id: 17, text: "Team members feel comfortable asking clarifying questions.", category: "communication" },
  { id: 18, text: "We communicate early when something is unclear or risky.", category: "communication" },
  { id: 19, text: "Team members speak up openly, even about difficult topics.", category: "trust" },
  { id: 20, text: "Conflicts are addressed constructively, not avoided.", category: "trust" },
  { id: 21, text: "Team members trust each other to deliver quality work.", category: "trust" },
  { id: 22, text: "People admit mistakes without fear of punishment.", category: "trust" },
  { id: 23, text: "Feedback is shared regularly and respectfully.", category: "trust" },
  { id: 24, text: "Everyone feels included and valued during discussions.", category: "trust" },
  { id: 25, text: "The team understands why we build what we build.", category: "value" },
  { id: 26, text: "The product owner (or equivalent) provides clear direction.", category: "value" },
  { id: 27, text: "We validate whether the features we deliver create value.", category: "value" },
  { id: 28, text: "The Definition of Done is clear and consistently followed.", category: "value" },
  { id: 29, text: "We focus on solving real customer or business problems.", category: "value" },
  { id: 30, text: "The team understands success metrics for our product/work.", category: "value" },
  { id: 31, text: "Leaders empower the team rather than micromanage.", category: "leadership" },
  { id: 32, text: "Decisions are made quickly and clearly.", category: "leadership" },
  { id: 33, text: "The team regularly reflects and improves its process.", category: "leadership" },
  { id: 34, text: "Agile/Scrum ceremonies have purpose and value.", category: "leadership" },
  { id: 35, text: "The team has autonomy to choose how to work.", category: "leadership" },
  { id: 36, text: "Roles and responsibilities are clear.", category: "leadership" },
];

const ratingLabels = ["Never", "Rarely", "Sometimes", "Often", "Always"];

const categoryNames: Record<string, string> = {
  delivery: "Delivery & Predictability",
  ownership: "Ownership & Accountability",
  communication: "Communication & Collaboration",
  trust: "Trust & Psychological Safety",
  value: "Value & Purpose",
  leadership: "Leadership & Process",
};

const categoryColors: Record<string, string> = {
  delivery: "bg-step-1",
  ownership: "bg-step-2",
  communication: "bg-step-3",
  trust: "bg-primary",
  value: "bg-accent",
  leadership: "bg-gradient-middle",
};

// Maturity levels mapping
const maturityLevels: Record<number, { name: string; description: string }> = {
  1: { name: "Ad‑hoc", description: "Work is mostly reactive, roles unclear, success depends on a few individuals." },
  2: { name: "Emerging", description: "Some routines exist, but they are inconsistent and often bypassed under pressure." },
  3: { name: "Defined", description: "Ways of working are agreed, most people follow them, issues are discussed openly." },
  4: { name: "Proactive", description: "Team anticipates problems, uses data and feedback, and improves its own process." },
  5: { name: "Adaptive", description: "Team continuously experiments, aligns tightly with stakeholders, and improves faster than its environment." },
};

// Score to maturity level mapping (percentage based)
const getMaturityLevel = (scorePercent: number): number => {
  if (scorePercent < 40) return 1;
  if (scorePercent < 50) return 2;
  if (scorePercent < 70) return 3;
  if (scorePercent < 85) return 4;
  return 5;
};

const actionPointsByCategory: Record<string, Record<number, { level: string; actions: string }>> = {
  delivery: {
    1: { level: "Critical", actions: "Stop starting, start finishing; limit WIP; create basic board; daily check‑ins on blocked work." },
    2: { level: "Weak", actions: "Add simple workflow policies; introduce basic estimation; start weekly planning and review." },
    3: { level: "Moderate", actions: "Refine backlog; use clear acceptance criteria; track flow metrics (cycle time, throughput)." },
    4: { level: "Strong", actions: "Optimize handovers; experiment with smaller batch sizes; introduce service‑level expectations." },
    5: { level: "Excellent", actions: "Protect focus time; use data to forecast; share delivery insights with stakeholders regularly." },
  },
  ownership: {
    1: { level: "Critical", actions: "Clarify who owns what; define roles and responsibilities; set visible team goals." },
    2: { level: "Weak", actions: "Introduce simple \"DRI\" (directly responsible individual) per work item; agree on basic working agreements." },
    3: { level: "Moderate", actions: "Regularly review commitments vs. outcomes; add short \"what did we learn?\" reviews." },
    4: { level: "Strong", actions: "Empower team to self‑assign work; use peer commitments instead of only manager‑driven tasks." },
    5: { level: "Excellent", actions: "Encourage experimentation with clear owners; celebrate accountability stories publicly." },
  },
  communication: {
    1: { level: "Critical", actions: "Establish minimum communication rhythm (daily/weekly); decide which channels for what." },
    2: { level: "Weak", actions: "Introduce short check‑ins; document decisions in one shared place; encourage clarification questions." },
    3: { level: "Moderate", actions: "Run regular retros; pair or mob on complex work; visualise dependencies." },
    4: { level: "Strong", actions: "Encourage cross‑team syncs; rotate facilitation; practice structured decision techniques." },
    5: { level: "Excellent", actions: "Share knowledge intentionally (brown‑bags, demos); coach others in feedback and facilitation." },
  },
  trust: {
    1: { level: "Critical", actions: "Address obvious harmful behaviours; set ground rules for respect; offer anonymous input options." },
    2: { level: "Weak", actions: "Start regular \"temperature checks\"; leaders model vulnerability (admit mistakes, ask for help)." },
    3: { level: "Moderate", actions: "Introduce feedback norms (\"clear, kind, specific\"); use blameless reviews after issues." },
    4: { level: "Strong", actions: "Invite dissenting views explicitly; rotate meeting ownership to increase voice diversity." },
    5: { level: "Excellent", actions: "Run periodic \"team agreements\" refresh; support peer coaching and mentoring." },
  },
  value: {
    1: { level: "Critical", actions: "Clarify basic mission and for whom the team creates value; map current work to that mission." },
    2: { level: "Weak", actions: "Define 2–3 near‑term outcomes; stop or pause work that clearly does not align." },
    3: { level: "Moderate", actions: "Use simple OKRs or goals; regularly connect tasks to customer problems." },
    4: { level: "Strong", actions: "Involve team in prioritisation; review impact metrics, not just output." },
    5: { level: "Excellent", actions: "Invite customers or stakeholders to demos; co‑create roadmap with evidence from users." },
  },
  leadership: {
    1: { level: "Critical", actions: "Ensure basic structure: regular planning, check‑ins, and reviews; reduce ad‑hoc chaos." },
    2: { level: "Weak", actions: "Clarify decision rights; leaders communicate priorities and constraints; start documenting process." },
    3: { level: "Moderate", actions: "Introduce continuous‑improvement loop; review and adjust process each sprint/month." },
    4: { level: "Strong", actions: "Delegate decisions closer to the work; use data to fine‑tune process (bottlenecks, delays)." },
    5: { level: "Excellent", actions: "Leaders act as coaches; process is lightweight, regularly pruned, and co‑owned by the team." },
  },
};

const getMaturityLevelColor = (level: number) => {
  switch (level) {
    case 1: return "text-red-600 bg-red-50 border-red-200";
    case 2: return "text-orange-600 bg-orange-50 border-orange-200";
    case 3: return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case 4: return "text-green-600 bg-green-50 border-green-200";
    case 5: return "text-emerald-600 bg-emerald-50 border-emerald-200";
    default: return "text-muted-foreground bg-muted border-border";
  }
};


const Diagnostics = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [showPopup, setShowPopup] = useState(false);

  const completedCount = Object.keys(answers).length;
  const progress = (completedCount / questions.length) * 100;

  const handleAnswer = (questionId: number, rating: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: rating }));
  };

  const calculateResults = () => {
    const categoryScores: Record<string, { total: number; count: number }> = {};

    questions.forEach((q) => {
      if (answers[q.id]) {
        if (!categoryScores[q.category]) {
          categoryScores[q.category] = { total: 0, count: 0 };
        }
        categoryScores[q.category].total += answers[q.id];
        categoryScores[q.category].count += 1;
      }
    });

    return Object.entries(categoryScores).map(([category, { total, count }]) => ({
      category,
      name: categoryNames[category],
      score: Math.round((total / count) * 20),
      average: (total / count).toFixed(1),
      averageRaw: total / count,
      color: categoryColors[category],
    }));
  };

  const handleShowResults = () => {
    setShowResults(true);
    setTimeout(() => {
      setShowPopup(true);
    }, 1500);
  };

  const results = calculateResults();
  const overallScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)
    : 0;

  // Prepare radar chart data
  const radarData = results.map((r) => ({
    category: r.name.split(" ")[0],
    fullName: r.name,
    value: r.averageRaw,
    fullMark: 5,
  }));

  const getActionPoints = () => {
    return results.map((r) => {
      const maturityLevel = getMaturityLevel(r.score);
      const maturityInfo = maturityLevels[maturityLevel];
      const actionData = actionPointsByCategory[r.category]?.[maturityLevel];
      return {
        category: r.category,
        name: r.name,
        score: r.score,
        maturityLevel,
        maturityName: maturityInfo?.name || "Unknown",
        maturityDescription: maturityInfo?.description || "",
        actions: actionData?.actions || "No specific actions available.",
      };
    });
  };

  const overallMaturityLevel = getMaturityLevel(overallScore);
  const overallMaturityInfo = maturityLevels[overallMaturityLevel];

  const handleSubmitAssessment = async () => {
    if (!email) return;
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-assessment-request", {
        body: { 
          email, 
          results: results.map(r => ({
            category: r.category,
            name: r.name,
            score: r.score,
            average: r.average,
          })),
          overallScore 
        },
      });

      if (error) throw error;

      toast({
        title: "Request received!",
        description: "We'll send your results and team assessment details to " + email,
      });
      setShowPopup(false);
    } catch (error: any) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Failed to submit",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showReport) {
    const actionPoints = getActionPoints();
    return (
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-background border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={teamHealthLogo} alt="TeamHealth" className="h-10 w-auto" />
            </Link>
            <Button variant="ghost" onClick={() => setShowReport(false)}>
              Back to Results
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Overall Maturity */}
          <div className="bg-background rounded-xl p-8 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">Action Report</h1>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Team Maturity</p>
                <p className="text-2xl font-bold text-foreground">{overallScore}%</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getMaturityLevelColor(overallMaturityLevel)}`}>
                  Level {overallMaturityLevel} – {overallMaturityInfo?.name}
                </span>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  {overallMaturityInfo?.description}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Based on your assessment scores, here are personalized recommendations for each category.
            </p>
          </div>

          <div className="space-y-4">
            {actionPoints.map((item) => (
              <div key={item.category} className="bg-background rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{item.score}%</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getMaturityLevelColor(item.maturityLevel)}`}>
                      Level {item.maturityLevel} – {item.maturityName}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 italic">
                  {item.maturityDescription}
                </p>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-1">Suggested Actions:</p>
                  <p className="text-foreground">{item.actions}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" size="lg" onClick={() => setShowReport(false)}>
              Back to Results
            </Button>
            <Button size="lg" onClick={() => setShowPopup(true)}>
              Request Full Team Assessment
            </Button>
          </div>
        </main>

        {/* Results Popup - same as before */}
        <Dialog open={showPopup} onOpenChange={setShowPopup}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                Important Notice
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">This data will not be stored</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Your responses are only visible during this session and will be lost when you leave.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">This is your perception</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Remember, this reflects your individual view of the team. Other team members may have different perspectives.
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Want the full picture?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get a comprehensive team assessment with analysis of all team members' answers 
                    and a detailed summary of changes needed.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Full Team Assessment</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your email to receive these results and get a complete team assessment
                  </p>
                  
                  <div className="mb-4">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-center"
                    />
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-primary">€29</span>
                    <span className="text-muted-foreground ml-2">one-time</span>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full"
                    disabled={!email || isSubmitting}
                    onClick={handleSubmitAssessment}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Get Team Assessment"
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Includes: Team-wide survey • Aggregated analysis • Action recommendations
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={teamHealthLogo} alt="TeamHealth" className="h-10 w-auto" />
          </Link>
          <Link to="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {!showResults ? (
          <>
            {/* Assessment Header */}
            <div className="bg-background rounded-xl p-8 shadow-sm mb-6">
              <h1 className="text-3xl font-bold text-primary mb-4">
                Team Health Diagnostic Assessment
              </h1>
              <p className="text-muted-foreground mb-6">
                This assessment helps identify your team's strengths and areas for improvement 
                across six key dimensions. Rate each statement on a scale of 1-5 based on how 
                often it applies to your team.
              </p>
              
              {/* Rating Legend */}
              <div className="flex justify-between gap-2 mb-6">
                {ratingLabels.map((label, index) => (
                  <div key={label} className="text-center">
                    <div className="text-primary font-semibold">{index + 1}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">{completedCount} / {questions.length} completed</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="bg-background rounded-xl p-6 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {question.id}
                    </span>
                    <p className="text-foreground font-medium pt-1">{question.text}</p>
                  </div>
                  <div className="flex gap-2 ml-12">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleAnswer(question.id, rating)}
                        className={`flex-1 py-3 px-2 rounded-lg border-2 transition-all ${
                          answers[question.id] === rating
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        <div className="font-semibold">{rating}</div>
                        <div className="text-xs text-muted-foreground">{ratingLabels[rating - 1]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-8 text-center">
              <Button
                size="lg"
                onClick={handleShowResults}
                disabled={completedCount < questions.length}
                className="px-12"
              >
                Calculate Team Results
              </Button>
              {completedCount < questions.length && (
                <p className="text-sm text-muted-foreground mt-2">
                  Please answer all {questions.length} questions to see your results
                </p>
              )}
            </div>
          </>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            <div className="bg-background rounded-xl p-8 shadow-sm text-center">
              <h1 className="text-3xl font-bold text-primary mb-2">Your Team Health Score</h1>
              <div className="text-6xl font-bold text-primary my-6">{overallScore}%</div>
              <p className="text-muted-foreground">
                Based on your responses across {results.length} key dimensions
              </p>
            </div>

            {/* Radar Chart */}
            <div className="bg-background rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Team Health Radar</h2>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="category" 
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 5]} 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Scores */}
            <div className="grid gap-4">
              {results.map((result) => (
                <div key={result.category} className="bg-background rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{result.name}</h3>
                    <span className="text-lg font-bold text-primary">{result.score}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${result.color} transition-all duration-500`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Average rating: {result.average}/5
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link to="/">
                <Button variant="outline" size="lg">
                  Back to Home
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => setShowReport(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Get Action Report
              </Button>
              <Button 
                size="lg" 
                onClick={() => setShowPopup(true)}
              >
                Request Team Health Check
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Results Popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              Important Notice
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">This data will not be stored</p>
                <p className="text-sm text-amber-700 mt-1">
                  Your responses are only visible during this session and will be lost when you leave.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">This is your perception</p>
                <p className="text-sm text-blue-700 mt-1">
                  Remember, this reflects your individual view of the team. Other team members may have different perspectives.
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  Want the full picture?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get a comprehensive team assessment with analysis of all team members' answers 
                  and a detailed summary of changes needed.
                </p>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Full Team Assessment</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your email to receive these results and get a complete team assessment
                </p>
                
                <div className="mb-4">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-center"
                  />
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">€29</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
                </div>
                <Button 
                  size="lg" 
                  className="w-full"
                  disabled={!email || isSubmitting}
                  onClick={handleSubmitAssessment}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Get Team Assessment"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Includes: Team-wide survey • Aggregated analysis • Action recommendations
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Diagnostics;
