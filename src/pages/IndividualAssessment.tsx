import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Loader2, FileText, Download, Users, GitMerge } from "lucide-react";
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

interface TeamResult {
  category: string;
  name: string;
  score: number;
  average: string;
  averageRaw: number;
}

// Individual assessment questions - 12 questions (2 per category)
const individualQuestions = [
  // Delivery & Predictability
  {
    id: 1,
    category: "delivery",
    text: "When I commit to work, I…",
    options: [
      "Rarely finish on time and usually do not warn others.",
      "Sometimes finish on time but often forget to warn others when there are issues.",
      "Usually finish on time, and I sometimes warn others if I see a risk.",
      "Almost always finish on time and normally warn others early about risks.",
      "Consistently finish on time and proactively warn others early when there is any risk."
    ]
  },
  {
    id: 2,
    category: "delivery",
    text: "How do I manage my tasks so others can rely on my progress?",
    options: [
      "My tasks are often unclear, and others do not know where I am.",
      "I sometimes break work down, but my progress is still hard to follow.",
      "I keep basic notes or a board, so people can usually see where I am.",
      "I regularly break work into clear steps that others can easily track.",
      "My tasks are very clearly broken down and visible, so others can confidently plan around me."
    ]
  },
  // Ownership & Accountability
  {
    id: 3,
    category: "ownership",
    text: "When I take ownership of a task or topic, I…",
    options: [
      "Often drop it or forget it until someone chases me.",
      "Sometimes complete it, sometimes let it slip without telling others.",
      "Usually complete it but need occasional reminders.",
      "Almost always drive it to completion without reminders.",
      "Consistently own it end‑to‑end, including follow‑up and communication."
    ]
  },
  {
    id: 4,
    category: "ownership",
    text: "When something goes wrong, my first reaction is usually…",
    options: [
      "To blame others or external factors and move on.",
      "To feel annoyed and mostly think about what others did wrong.",
      "To see a mix of my part and others' part in the problem.",
      "To look honestly at what I can change in my own behaviour.",
      "To quickly own my part, learn from it, and help the team avoid it next time."
    ]
  },
  // Communication & Collaboration
  {
    id: 5,
    category: "communication",
    text: "How do I keep others informed about my work?",
    options: [
      "I rarely inform others unless they ask directly.",
      "I sometimes give updates, but usually late or incomplete.",
      "I give basic updates at expected moments (e.g., meetings).",
      "I proactively share clear updates when something changes or matters to others.",
      "I consistently give timely, targeted updates that help others make decisions."
    ]
  },
  {
    id: 6,
    category: "communication",
    text: "When I communicate with different people, I…",
    options: [
      "Use the same style for everyone, even if it causes confusion.",
      "Sometimes adjust, but often forget and create misunderstandings.",
      "Adjust a bit depending on the person or situation.",
      "Usually adapt my detail, channel, and tone to make it easy for others.",
      "Very consciously adapt my communication so different people get exactly what they need."
    ]
  },
  // Trust & Psychological Safety
  {
    id: 7,
    category: "trust",
    text: "How open am I about mistakes or not knowing something?",
    options: [
      "I hide mistakes and avoid admitting when I do not know something.",
      "I sometimes admit issues, but only when I have no other choice.",
      "I admit some mistakes or gaps, mainly in safe situations.",
      "I am generally open about mistakes and uncertainties, even if it feels uncomfortable.",
      "I openly share mistakes and learning, and I encourage others to do the same."
    ]
  },
  {
    id: 8,
    category: "trust",
    text: "How do I respond when people disagree with me?",
    options: [
      "I shut down disagreement or react defensively.",
      "I tolerate it, but it clearly bothers me.",
      "I listen, though I may still feel defensive inside.",
      "I listen carefully and try to understand their point of view.",
      "I actively invite different opinions and use them to improve decisions."
    ]
  },
  // Value & Purpose
  {
    id: 9,
    category: "value",
    text: "How clear am I about how my work adds value to the team or customers?",
    options: [
      "I usually do tasks without knowing why they matter.",
      "I sometimes know the purpose, but often feel disconnected from the bigger picture.",
      "I have a general idea of why my work matters.",
      "I clearly understand how my work supports our team goals.",
      "I can clearly explain how my work creates value, and I use that to guide my choices."
    ]
  },
  {
    id: 10,
    category: "value",
    text: "When work seems low‑value or unclear, I usually…",
    options: [
      "Just do it without asking questions.",
      "Sometimes question it, but usually keep quiet.",
      "Ask for clarification when it feels really confusing.",
      "Regularly ask clarifying questions and suggest alternatives.",
      "Proactively challenge low‑value work and help redirect effort to what matters most."
    ]
  },
  // Leadership & Process
  {
    id: 11,
    category: "leadership",
    text: "How much do I contribute to improving how our team works (not just what we deliver)?",
    options: [
      "I almost never think about or discuss how we work.",
      "I occasionally mention problems but rarely propose improvements.",
      "I sometimes suggest improvements when issues become painful.",
      "I regularly propose and support small improvements to our ways of working.",
      "I actively look for better ways of working and help the team turn ideas into habits."
    ]
  },
  {
    id: 12,
    category: "leadership",
    text: "When others are stuck or overloaded, I…",
    options: [
      "Focus only on my own tasks, even if others struggle.",
      "Sometimes notice, but rarely offer help.",
      "Offer help when directly asked.",
      "Often notice and offer help without being asked.",
      "Proactively look for chances to unblock others and move team work forward."
    ]
  },
];

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

// Maturity levels mapping
const maturityLevels: Record<number, { name: string; description: string }> = {
  1: { name: "Ad‑hoc", description: "Work is mostly reactive, roles unclear, success depends on a few individuals." },
  2: { name: "Emerging", description: "Some routines exist, but they are inconsistent and often bypassed under pressure." },
  3: { name: "Defined", description: "Ways of working are agreed, most people follow them, issues are discussed openly." },
  4: { name: "Proactive", description: "Team anticipates problems, uses data and feedback, and improves its own process." },
  5: { name: "Adaptive", description: "Team continuously experiments, aligns tightly with stakeholders, and improves faster than its environment." },
};

// Granular overall maturity descriptions
const getOverallMaturityDescription = (scorePercent: number): { level: string; name: string; description: string } => {
  if (scorePercent < 20) {
    return {
      level: "1.0",
      name: "Very low maturity",
      description: "You are at a very early stage of individual maturity. Work is mostly reactive, priorities change frequently, and results depend heavily on external direction rather than a stable way of working."
    };
  }
  if (scorePercent < 30) {
    return {
      level: "1.5",
      name: "Low maturity",
      description: "You show early signs of structure, but most of the time operate in \"firefighting mode\". Agreements are fragile and often ignored under pressure."
    };
  }
  if (scorePercent < 40) {
    return {
      level: "2.0",
      name: "Emerging maturity",
      description: "You have started to put basic routines and agreements in place. Planning and communication are somewhat clearer, but still inconsistent."
    };
  }
  if (scorePercent < 50) {
    return {
      level: "2.5",
      name: "Early developing",
      description: "The foundation for a more stable way of working is visible. You follow some shared practices and there is a growing willingness to improve."
    };
  }
  if (scorePercent < 60) {
    return {
      level: "3.0",
      name: "Defined maturity",
      description: "You have a defined way of working that you understand and follow. Goals and responsibilities are clear enough to deliver reliably in normal conditions."
    };
  }
  if (scorePercent < 70) {
    return {
      level: "3.5",
      name: "Solid but uneven",
      description: "You operate on a generally solid foundation and can handle typical challenges with reasonable confidence. One or two areas still lag behind."
    };
  }
  if (scorePercent < 80) {
    return {
      level: "4.0",
      name: "Proactive maturity",
      description: "You are proactive in how you work and improve. You use feedback and reflection to spot problems early and address them before they grow."
    };
  }
  if (scorePercent < 90) {
    return {
      level: "4.5",
      name: "High, sustainable performance",
      description: "You demonstrate high maturity across most dimensions and perform strongly even under pressure. You continually refine how you deliver value."
    };
  }
  return {
    level: "5.0",
    name: "Exceptional, adaptive maturity",
    description: "You operate at an exceptional level of maturity. You combine clarity, trust, and discipline with a strong appetite for learning and innovation."
  };
};

const getMaturityLevel = (scorePercent: number): number => {
  if (scorePercent < 40) return 1;
  if (scorePercent < 50) return 2;
  if (scorePercent < 70) return 3;
  if (scorePercent < 85) return 4;
  return 5;
};

// Individual action points feedback
const individualActionFeedback: Record<string, { high: string[]; medium: string[]; low: string[] }> = {
  delivery: {
    high: [
      "Delivery & Predictability: Consistently delivers on commitments and surfaces risks early, which increases the team's reliability.",
      "Delivery & Predictability: Breaks work into clear steps so others can easily track progress and plan around it.",
      "Delivery & Predictability: Helps stabilise delivery during busy periods by staying organised and focused."
    ],
    medium: [
      "Delivery & Predictability: Delivers reliably in most situations, with some room to signal risks earlier.",
      "Delivery & Predictability: Keeps basic structure around tasks; sharpening breakdown and planning would further boost predictability.",
      "Delivery & Predictability: Handles normal workload well; next step is to sustain the same predictability under changing priorities."
    ],
    low: [
      "Delivery & Predictability: Would benefit from clearer task breakdown and more proactive updates to avoid last‑minute surprises.",
      "Delivery & Predictability: Needs support to plan work realistically and communicate when deadlines are at risk.",
      "Delivery & Predictability: Strengthening basic work organisation will make it easier for others to rely on commitments."
    ]
  },
  ownership: {
    high: [
      "Ownership & Accountability: Takes clear end‑to‑end ownership and can be trusted to follow through without reminders.",
      "Ownership & Accountability: Quickly steps up when issues arise and focuses on solutions rather than blame.",
      "Ownership & Accountability: Others see this person as a dependable 'go‑to' for important tasks."
    ],
    medium: [
      "Ownership & Accountability: Generally owns tasks to completion; tightening follow‑through in busy periods would increase impact.",
      "Ownership & Accountability: Accepts responsibility, with occasional gaps when priorities shift quickly.",
      "Ownership & Accountability: Shows growing ownership; next step is to communicate more clearly about status and obstacles."
    ],
    low: [
      "Ownership & Accountability: Could take clearer end‑to‑end ownership for tasks, especially when priorities change.",
      "Ownership & Accountability: Needs support to move from reacting to issues towards proactively taking responsibility.",
      "Ownership & Accountability: Clarifying what is 'mine to own' versus 'ours to share' will help strengthen accountability."
    ]
  },
  communication: {
    high: [
      "Communication & Collaboration: Frequently keeps stakeholders informed and adapts communication style to different colleagues.",
      "Communication & Collaboration: Actively listens, involves others, and contributes to a constructive team atmosphere.",
      "Communication & Collaboration: Shares information early, which reduces misunderstandings and rework."
    ],
    medium: [
      "Communication & Collaboration: Communicates reliably in standard settings; being more proactive with ad‑hoc updates would help.",
      "Communication & Collaboration: Collaborates well with familiar colleagues; extending this to a wider group would add value.",
      "Communication & Collaboration: Next step is to make expectations and decisions even more explicit for the whole team."
    ],
    low: [
      "Communication & Collaboration: Would benefit from sharing updates more regularly so others are not surprised by changes.",
      "Communication & Collaboration: Strengthening listening and clarification skills will reduce friction and misalignment.",
      "Communication & Collaboration: Needs encouragement to involve others earlier instead of working in isolation."
    ]
  },
  trust: {
    high: [
      "Trust & Psychological Safety: Openly shares mistakes and learnings, which encourages others to be honest as well.",
      "Trust & Psychological Safety: Invites different opinions and handles disagreement constructively.",
      "Trust & Psychological Safety: Creates a calm, respectful atmosphere where people feel safe to speak up."
    ],
    medium: [
      "Trust & Psychological Safety: Generally respectful; can deepen impact by being more open about own uncertainties.",
      "Trust & Psychological Safety: Handles everyday conflict adequately; next step is to actively invite diverse viewpoints.",
      "Trust & Psychological Safety: Sometimes shares concerns; doing so earlier would help the team address issues sooner."
    ],
    low: [
      "Trust & Psychological Safety: Can practice sharing mistakes and uncertainties earlier to invite more support from the team.",
      "Trust & Psychological Safety: May react defensively to feedback; building skills in reflective listening will increase trust.",
      "Trust & Psychological Safety: Needs support to create more space for others to express concerns and dissenting opinions."
    ]
  },
  value: {
    high: [
      "Value & Purpose: Clearly understands how their work contributes to team goals and uses that to guide decisions.",
      "Value & Purpose: Regularly questions low‑value work and helps focus effort on what matters most.",
      "Value & Purpose: Brings a strong customer / business perspective into day‑to‑day discussions."
    ],
    medium: [
      "Value & Purpose: Has a good sense of the bigger picture; could make this link even more explicit in daily choices.",
      "Value & Purpose: Sometimes challenges unclear work; doing this more consistently would increase impact.",
      "Value & Purpose: Next step is to involve stakeholders more when priorities or value assumptions are uncertain."
    ],
    low: [
      "Value & Purpose: Would benefit from more clarity on how tasks connect to team and customer outcomes.",
      "Value & Purpose: Tends to execute without questioning value; practicing simple 'why' and 'for whom' questions will help.",
      "Value & Purpose: Needs support in prioritising higher‑value work when facing competing demands."
    ]
  },
  leadership: {
    high: [
      "Leadership & Process: Actively helps improve how the team works, not just what it delivers.",
      "Leadership & Process: Often supports others when they are stuck and contributes to keeping work flowing.",
      "Leadership & Process: Shows informal leadership by suggesting and sustaining practical process improvements."
    ],
    medium: [
      "Leadership & Process: Occasionally proposes improvements; making this a regular habit would multiply impact.",
      "Leadership & Process: Helps others when asked; initiating support more often would strengthen team performance.",
      "Leadership & Process: Shows emerging leadership behaviours that can be grown through targeted opportunities."
    ],
    low: [
      "Leadership & Process: Focuses mainly on own tasks; could look more for chances to help improve the team's way of working.",
      "Leadership & Process: Needs encouragement to step in when others are stuck or processes are clearly not working.",
      "Leadership & Process: Developing comfort with small experiments and suggestions will help build leadership skills."
    ]
  }
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

const IndividualAssessment = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showMergedReport, setShowMergedReport] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get team results from navigation state if available
  const [teamResults, setTeamResults] = useState<TeamResult[] | null>(null);
  const [teamOverallScore, setTeamOverallScore] = useState<number | null>(null);
  
  useEffect(() => {
    if (location.state?.teamResults) {
      setTeamResults(location.state.teamResults);
      setTeamOverallScore(location.state.teamOverallScore);
    }
  }, [location.state]);

  const completedCount = Object.keys(answers).length;
  const progress = (completedCount / individualQuestions.length) * 100;

  const handleAnswer = (questionId: number, rating: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: rating }));
  };

  const calculateResults = () => {
    const categoryScores: Record<string, { total: number; count: number }> = {};

    individualQuestions.forEach((q) => {
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

  const radarData = results.map((r) => ({
    category: r.name.split(" ")[0],
    fullName: r.name,
    value: r.averageRaw,
    fullMark: 5,
  }));

  const getScoreLevel = (score: number): "high" | "medium" | "low" => {
    if (score >= 80) return "high";
    if (score >= 60) return "medium";
    return "low";
  };

  const getActionPoints = () => {
    return results.map((r) => {
      const maturityLevel = getMaturityLevel(r.score);
      const maturityInfo = maturityLevels[maturityLevel];
      const scoreLevel = getScoreLevel(r.score);
      const feedback = individualActionFeedback[r.category]?.[scoreLevel] || [];
      
      return {
        category: r.category,
        name: r.name,
        score: r.score,
        maturityLevel,
        maturityName: maturityInfo?.name || "Unknown",
        maturityDescription: maturityInfo?.description || "",
        feedback,
        scoreLevel,
      };
    });
  };

  const overallMaturityLevel = getMaturityLevel(overallScore);
  const granularMaturity = getOverallMaturityDescription(overallScore);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      pdf.setFontSize(24);
      pdf.setTextColor(33, 33, 33);
      pdf.text("Individual Assessment Report", margin, yPos);
      yPos += 15;

      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Overall Score: ${overallScore}%`, margin, yPos);
      yPos += 8;

      pdf.setFontSize(16);
      pdf.setTextColor(33, 33, 33);
      pdf.text(`Level ${granularMaturity.level} - ${granularMaturity.name}`, margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      const descLines = pdf.splitTextToSize(granularMaturity.description, pageWidth - 2 * margin);
      pdf.text(descLines, margin, yPos);
      yPos += descLines.length * 5 + 10;

      const actionPoints = getActionPoints();
      actionPoints.forEach((item) => {
        if (yPos > 240) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFontSize(12);
        pdf.setTextColor(33, 33, 33);
        pdf.text(`${item.name} - ${item.score}%`, margin, yPos);
        yPos += 6;

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Level ${item.maturityLevel} - ${item.maturityName}`, margin, yPos);
        yPos += 8;

        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        pdf.text("Feedback:", margin, yPos);
        yPos += 5;

        item.feedback.forEach((fb) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          const fbLines = pdf.splitTextToSize(`• ${fb}`, pageWidth - 2 * margin - 5);
          pdf.text(fbLines, margin + 3, yPos);
          yPos += fbLines.length * 4 + 2;
        });
        yPos += 6;
      });

      pdf.save("individual-assessment-report.pdf");
      toast({
        title: "PDF exported!",
        description: "Your individual report has been downloaded.",
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

  const handleSubmitEmail = async () => {
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
          overallScore,
          assessmentType: "individual"
        },
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: "Your individual assessment results have been sent to " + email,
      });
      setShowPopup(false);
    } catch (error: any) {
      console.error("Error submitting:", error);
      toast({
        title: "Failed to send",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Merged Report View - Side by side comparison
  if (showMergedReport && teamResults) {
    const mergedData = results.map((r) => {
      const teamResult = teamResults.find(t => t.category === r.category);
      return {
        category: r.name.split(" ")[0],
        fullName: r.name,
        individual: r.averageRaw,
        team: teamResult?.averageRaw || 0,
        individualScore: r.score,
        teamScore: teamResult?.score || 0,
      };
    });

    return (
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={teamHealthLogo} alt="TeamHealth" className="h-10 w-auto" />
            </Link>
            <Button variant="ghost" onClick={() => setShowMergedReport(false)}>
              Back to Results
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="bg-background rounded-xl p-8 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <GitMerge className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">Merged Report</h1>
            </div>
            <p className="text-muted-foreground mb-6">
              Compare your individual assessment with the team assessment to identify perception gaps and alignment areas.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400">Team Score</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{teamOverallScore}%</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-600 dark:text-purple-400">Your Score</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{overallScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-xl p-8 shadow-sm mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Comparison Radar</h2>
            <div className="w-full h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mergedData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 13, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 5]} 
                    tickCount={11}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <Radar
                    name="Team"
                    dataKey="team"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Individual"
                    dataKey="individual"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-sm text-muted-foreground">Team</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-500"></div>
                <span className="text-sm text-muted-foreground">Individual</span>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Score Comparison by Category</h2>
            <div className="space-y-4">
              {mergedData.map((item) => {
                const diff = item.individualScore - item.teamScore;
                const diffLabel = diff > 0 ? `+${diff}%` : `${diff}%`;
                const diffColor = diff > 5 ? "text-green-600" : diff < -5 ? "text-red-600" : "text-muted-foreground";
                return (
                  <div key={item.fullName} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground">{item.fullName}</h3>
                      <span className={`text-sm font-semibold ${diffColor}`}>
                        {diff !== 0 && diffLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                        <span className="text-sm text-muted-foreground">Team:</span>
                        <span className="text-sm font-semibold">{item.teamScore}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-500"></div>
                        <span className="text-sm text-muted-foreground">You:</span>
                        <span className="text-sm font-semibold">{item.individualScore}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button variant="outline" size="lg" onClick={() => setShowMergedReport(false)}>
              Back to Results
            </Button>
            <Link to="/">
              <Button size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (showReport) {
    const actionPoints = getActionPoints();
    return (
      <div className="min-h-screen bg-muted/30">
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
          <div className="bg-background rounded-xl p-8 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">Individual Action Report</h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Your Individual Maturity</p>
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
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-2">
                    {item.scoreLevel === "high" ? "Strengths" : item.scoreLevel === "medium" ? "Mixed" : "Development Focus"}:
                  </p>
                  <ul className="space-y-2">
                    {item.feedback.map((fb, idx) => (
                      <li key={idx} className="text-sm text-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{fb}</span>
                      </li>
                    ))}
                  </ul>
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
            <Button size="lg" onClick={() => navigate("/diagnostics")}>
              <Users className="w-4 h-4 mr-2" />
              Take Team Assessment
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
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
            <div className="bg-background rounded-xl p-8 shadow-sm mb-6">
              <h1 className="text-3xl font-bold text-primary mb-4">
                Individual Lens Assessment
              </h1>
              <p className="text-muted-foreground mb-6">
                This self-assessment helps you understand your individual strengths and development areas 
                across six key dimensions. Select the option that best describes your typical behaviour.
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">{completedCount} / {individualQuestions.length} completed</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            <div className="space-y-6">
              {individualQuestions.map((question) => (
                <div key={question.id} className="bg-background rounded-xl p-6 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {question.id}
                    </span>
                    <div>
                      <p className="text-foreground font-medium">{question.text}</p>
                    </div>
                  </div>
                  <div className="space-y-2 ml-12">
                    {question.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(question.id, idx + 1)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                          answers[question.id] === idx + 1
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                            answers[question.id] === idx + 1
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={answers[question.id] === idx + 1 ? "text-primary font-medium" : "text-foreground"}>
                            {option}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                onClick={handleShowResults}
                disabled={completedCount < individualQuestions.length}
                className="px-12"
              >
                See My Results
              </Button>
              {completedCount < individualQuestions.length && (
                <p className="text-sm text-muted-foreground mt-2">
                  Please answer all {individualQuestions.length} questions to see your results
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-background rounded-xl p-8 shadow-sm text-center">
              <h1 className="text-3xl font-bold text-primary mb-2">Your Individual Score</h1>
              <div className="text-6xl font-bold text-primary my-6">{overallScore}%</div>
              <p className="text-muted-foreground">
                Based on your responses across {results.length} key dimensions
              </p>
            </div>

            <div className="bg-background rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Your Performance Radar</h2>
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

            <Button 
              variant="outline"
              size="lg" 
              className="w-full justify-start gap-3 h-auto py-4"
              disabled={!email || isSubmitting}
              onClick={handleSubmitEmail}
            >
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium">Get Summary on Email</p>
                <p className="text-xs text-muted-foreground font-normal">Free - Receive your results via email</p>
              </div>
            </Button>

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
                <p className="text-xs opacity-80 font-normal">Personalized feedback for each category</p>
              </div>
              <span className="font-bold">€29</span>
            </Button>

            {teamResults ? (
              <Button 
                variant="secondary"
                size="lg" 
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={() => {
                  setShowPopup(false);
                  setShowMergedReport(true);
                }}
              >
                <GitMerge className="w-5 h-5 flex-shrink-0" />
                <div className="text-left flex-1">
                  <p className="font-medium">Get Merged Report</p>
                  <p className="text-xs text-muted-foreground font-normal">Team vs Individual comparison</p>
                </div>
                <span className="font-bold">€29</span>
              </Button>
            ) : (
              <Button 
                variant="secondary"
                size="lg" 
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={() => {
                  setShowPopup(false);
                  navigate("/diagnostics");
                }}
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium">Take Team Assessment First</p>
                  <p className="text-xs text-muted-foreground font-normal">Then compare with your individual results</p>
                </div>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IndividualAssessment;
