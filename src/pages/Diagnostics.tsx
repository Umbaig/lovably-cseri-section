import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Mail, CheckCircle, Loader2, FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
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
  delivery: "bg-blue-500",
  ownership: "bg-green-500",
  communication: "bg-purple-500",
  trust: "bg-orange-500",
  value: "bg-pink-500",
  leadership: "bg-cyan-500",
};

const categoryHexColors: Record<string, string> = {
  delivery: "#3b82f6",
  ownership: "#22c55e",
  communication: "#a855f7",
  trust: "#f97316",
  value: "#ec4899",
  leadership: "#06b6d4",
};

// Maturity levels mapping for categories
const maturityLevels: Record<number, { name: string; description: string }> = {
  1: { name: "Ad‑hoc", description: "Work is mostly reactive, roles unclear, success depends on a few individuals." },
  2: { name: "Emerging", description: "Some routines exist, but they are inconsistent and often bypassed under pressure." },
  3: { name: "Defined", description: "Ways of working are agreed, most people follow them, issues are discussed openly." },
  4: { name: "Proactive", description: "Team anticipates problems, uses data and feedback, and improves its own process." },
  5: { name: "Adaptive", description: "Team continuously experiments, aligns tightly with stakeholders, and improves faster than its environment." },
};

// Granular overall maturity descriptions based on average score
const getOverallMaturityDescription = (scorePercent: number): { level: string; name: string; description: string } => {
  if (scorePercent < 20) {
    return {
      level: "1.0",
      name: "Very low maturity",
      description: "The team is at a very early stage of maturity. Work is mostly reactive, priorities change frequently, and results depend heavily on a few individuals rather than a stable way of working. There is little shared clarity on goals, roles, or expectations, which makes problems repeat instead of being systematically addressed."
    };
  }
  if (scorePercent < 30) {
    return {
      level: "1.5",
      name: "Low maturity",
      description: "The team shows early signs of structure, but most of the time operates in \"firefighting mode\". Some people try to create order, yet agreements are fragile and often ignored under pressure. Misunderstandings, rework, and frustration are common, and the team has limited confidence in its ability to deliver reliably."
    };
  }
  if (scorePercent < 40) {
    return {
      level: "2.0",
      name: "Emerging maturity",
      description: "The team has started to put basic routines and agreements in place. Planning, communication, and roles are somewhat clearer, but still inconsistent and dependent on who is present. Issues are noticed, yet they are more often worked around than solved, and the team is only beginning to think about long‑term improvement."
    };
  }
  if (scorePercent < 50) {
    return {
      level: "2.5",
      name: "Early developing",
      description: "The foundation for a more stable way of working is visible. The team follows some shared practices, and there is a growing willingness to talk about what is not working. However, discipline fluctuates, ownership is uneven across people, and the team still struggles to maintain predictability when priorities or workload shift."
    };
  }
  if (scorePercent < 60) {
    return {
      level: "3.0",
      name: "Defined maturity",
      description: "The team has a defined way of working that most people understand and follow. Goals, responsibilities, and basic processes are clear enough for the team to deliver reliably in normal conditions. At the same time, gaps in ownership, communication, or trust still create friction, and improvement tends to be reactive rather than planned."
    };
  }
  if (scorePercent < 70) {
    return {
      level: "3.5",
      name: "Solid but uneven",
      description: "The team operates on a generally solid foundation and can handle typical challenges with reasonable confidence. Collaboration, leadership, and process are often strong, but one or two areas still lag behind and limit overall performance. The team is aware of issues and talks about improvement, yet it has not fully turned that intent into consistent habits."
    };
  }
  if (scorePercent < 80) {
    return {
      level: "4.0",
      name: "Proactive maturity",
      description: "The team is proactive in how it works and improves. It uses data, feedback, and reflection to spot problems early and address them before they grow. Ownership is broadly shared, communication is transparent, and experiments to improve ways of working are becoming part of the team's normal behaviour."
    };
  }
  if (scorePercent < 90) {
    return {
      level: "4.5",
      name: "High, sustainable performance",
      description: "The team demonstrates high maturity across most dimensions and performs strongly even under pressure. It continually refines how it delivers value, adapts quickly to change, and learns from both success and failure. Remaining gaps are usually specific and known, and the team is already taking targeted steps to close them."
    };
  }
  return {
    level: "5.0",
    name: "Exceptional, adaptive maturity",
    description: "The team operates at an exceptional level of maturity. It combines clarity, trust, and discipline with a strong appetite for learning and innovation. Ways of working are co‑owned and regularly improved, the team and stakeholders are tightly aligned on outcomes, and the team reliably turns change and feedback into better results over time."
  };
};

// Score to maturity level mapping (percentage based) for categories
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
  const navigate = useNavigate();

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
  const granularMaturity = getOverallMaturityDescription(overallScore);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      // Title
      pdf.setFontSize(24);
      pdf.setTextColor(33, 33, 33);
      pdf.text("Team Health Action Report", margin, yPos);
      yPos += 15;

      // Overall Score
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Overall Score: ${overallScore}%`, margin, yPos);
      yPos += 8;

      pdf.setFontSize(16);
      pdf.setTextColor(33, 33, 33);
      pdf.text(`Level ${granularMaturity.level} - ${granularMaturity.name}`, margin, yPos);
      yPos += 10;

      // Overall description
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      const descLines = pdf.splitTextToSize(granularMaturity.description, pageWidth - 2 * margin);
      pdf.text(descLines, margin, yPos);
      yPos += descLines.length * 5 + 10;

      // Category sections
      const actionPoints = getActionPoints();
      actionPoints.forEach((item) => {
        // Check if we need a new page
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }

        // Category header
        pdf.setFontSize(12);
        pdf.setTextColor(33, 33, 33);
        pdf.text(`${item.name} - ${item.score}%`, margin, yPos);
        yPos += 6;

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Level ${item.maturityLevel} - ${item.maturityName}`, margin, yPos);
        yPos += 6;

        // Description
        pdf.setFontSize(9);
        pdf.setTextColor(120, 120, 120);
        const itemDescLines = pdf.splitTextToSize(item.maturityDescription, pageWidth - 2 * margin);
        pdf.text(itemDescLines, margin, yPos);
        yPos += itemDescLines.length * 4 + 4;

        // Actions
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text("Suggested Actions:", margin, yPos);
        yPos += 5;
        pdf.setFontSize(9);
        const actionLines = pdf.splitTextToSize(item.actions, pageWidth - 2 * margin);
        pdf.text(actionLines, margin, yPos);
        yPos += actionLines.length * 4 + 10;
      });

      pdf.save("team-health-report.pdf");
      toast({
        title: "PDF exported!",
        description: "Your action report has been downloaded.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Team Maturity</p>
                <p className="text-2xl font-bold text-foreground">{overallScore}%</p>
              </div>
              <div className="text-left sm:text-right">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getMaturityLevelColor(overallMaturityLevel)}`}>
                  Level {granularMaturity.level} – {granularMaturity.name}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {granularMaturity.description}
            </p>
            <p className="text-muted-foreground mt-4">
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

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button variant="outline" size="lg" onClick={() => setShowReport(false)}>
              Back to Results
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </>
              )}
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
              <div className="w-full h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="category" 
                      tick={({ x, y, payload, index }) => {
                        const color = categoryHexColors[results[index]?.category] || "hsl(var(--foreground))";
                        return (
                          <text
                            x={x}
                            y={y}
                            textAnchor="middle"
                            fill={color}
                            fontSize={13}
                            fontWeight={600}
                          >
                            {payload.value}
                          </text>
                        );
                      }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 5]} 
                      tickCount={11}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Scores - Compact Grid */}
            <div className="bg-background rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Category Scores</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {results.map((result) => (
                  <div 
                    key={result.category} 
                    className="p-3 rounded-lg border border-border"
                    style={{ borderLeftColor: categoryHexColors[result.category], borderLeftWidth: 4 }}
                  >
                    <p className="text-xs text-muted-foreground truncate">{result.name}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold" style={{ color: categoryHexColors[result.category] }}>
                        {result.score}%
                      </span>
                      <span className="text-xs text-muted-foreground">({result.average}/5)</span>
                    </div>
                  </div>
                ))}
              </div>
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
                onClick={() => setShowPopup(true)}
              >
                Next Steps
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Results Popup - Simplified with 3 options */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">
              What would you like to do?
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="mb-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-center"
              />
            </div>

            {/* Option 1: Get Summary on Email */}
            <Button 
              variant="outline"
              size="lg" 
              className="w-full justify-start gap-3 h-auto py-4"
              disabled={!email || isSubmitting}
              onClick={handleSubmitAssessment}
            >
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium">Get Summary on Email</p>
                <p className="text-xs text-muted-foreground font-normal">Free - Receive your results via email</p>
              </div>
            </Button>

            {/* Option 2: Buy Action Summary €29 */}
            <Button 
              size="lg" 
              className="w-full justify-start gap-3 h-auto py-4"
              disabled={!email}
              onClick={() => {
                setShowPopup(false);
                setShowReport(true);
              }}
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              <div className="text-left flex-1">
                <p className="font-medium">Get Action Report</p>
                <p className="text-xs opacity-80 font-normal">Detailed recommendations for each category</p>
              </div>
              <span className="font-bold">€29</span>
            </Button>

            {/* Option 3: Individual Lens Assessment */}
            <Button 
              variant="secondary"
              size="lg" 
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => {
                setShowPopup(false);
                navigate("/individual-assessment", {
                  state: {
                    teamResults: results.map(r => ({
                      category: r.category,
                      name: r.name,
                      score: r.score,
                      average: r.average,
                      averageRaw: r.averageRaw,
                    })),
                    teamOverallScore: overallScore
                  }
                });
              }}
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium">Individual Lens Assessment</p>
                <p className="text-xs text-muted-foreground font-normal">Compare individual vs team reports</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Diagnostics;
