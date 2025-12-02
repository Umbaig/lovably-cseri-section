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
import { AlertTriangle, Mail, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import teamHealthLogo from "@/assets/teamhealth-logo.png";

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

const Diagnostics = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
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

            <div className="flex justify-center gap-4 mt-8">
              <Link to="/">
                <Button variant="outline" size="lg">
                  Back to Home
                </Button>
              </Link>
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
