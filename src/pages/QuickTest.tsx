import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ExternalLink, Users } from "lucide-react";
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

// Quick test questions - 12 questions (2 per category)
const quickQuestions = [
  { id: 1, text: "We focus on fixing problems together instead of blaming individuals when things go wrong.", category: "trust" },
  { id: 2, text: "I feel safe sharing my honest opinion or admitting a mistake without being judged.", category: "trust" },
  { id: 3, text: "We \"swarm\" to help each other finish work rather than only focusing on our own tasks.", category: "collaboration" },
  { id: 4, text: "Information and skills are shared openly so that no single person is a bottleneck.", category: "collaboration" },
  { id: 5, text: "The team—not a manager—is responsible for ensuring our work is high quality and completely finished.", category: "ownership" },
  { id: 6, text: "We have the authority to change our own processes or tools if we think they aren't working.", category: "ownership" },
  { id: 7, text: "We deliver a working, finished piece of value every cycle without needing a last-minute rush to finish.", category: "delivery" },
  { id: 8, text: "We keep things simple and stop doing work that doesn't add real value to the product.", category: "delivery" },
  { id: 9, text: "We hold each other accountable for following our team's values and Agile principles.", category: "leadership" },
  { id: 10, text: "We actively coach and teach one another rather than waiting for someone to give us answers.", category: "leadership" },
  { id: 11, text: "We are comfortable saying \"no\" to unimportant tasks to stay focused on what matters most.", category: "value" },
  { id: 12, text: "We use real feedback from users to decide what we should build (or stop building) next.", category: "value" },
];

const ratingLabels = ["Never", "Rarely", "Sometimes", "Often", "Always"];

const categoryNames: Record<string, string> = {
  trust: "Trust",
  collaboration: "Collaboration",
  ownership: "Ownership",
  delivery: "Delivery",
  leadership: "Leadership",
  value: "Value",
};

const categoryHexColors: Record<string, string> = {
  trust: "#f97316",
  collaboration: "#a855f7",
  ownership: "#22c55e",
  delivery: "#3b82f6",
  leadership: "#06b6d4",
  value: "#ec4899",
};

const QuickTest = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [completionCount, setCompletionCount] = useState<number>(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(0);

  const completedCount = Object.keys(answers).length;
  const progress = (completedCount / quickQuestions.length) * 100;

  // Fetch current completion count
  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('quick_test_completions')
        .select('*', { count: 'exact', head: true });
      
      if (!error && count !== null) {
        setCompletionCount(count);
      }
    };
    fetchCount();
  }, []);

  const handleAnswer = (questionId: number, rating: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: rating }));
  };

  const calculateResults = () => {
    // Group questions by category and average the scores
    const categoryScores: Record<string, number[]> = {};
    quickQuestions.forEach((q) => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = [];
      }
      if (answers[q.id]) {
        categoryScores[q.category].push(answers[q.id]);
      }
    });

    return Object.keys(categoryNames).map((category) => ({
      category,
      name: categoryNames[category],
      score: categoryScores[category]?.length 
        ? categoryScores[category].reduce((a, b) => a + b, 0) / categoryScores[category].length 
        : 0,
      fullMark: 5,
    }));
  };

  const handleSubmit = async () => {
    // Record completion in database
    await supabase.from('quick_test_completions').insert({});
    
    // Start countdown animation
    setShowCountdown(true);
    const newCount = completionCount + 1;
    
    // Animate the counter
    let current = 0;
    const step = Math.ceil(newCount / 30);
    const interval = setInterval(() => {
      current += step;
      if (current >= newCount) {
        setCountdownNumber(newCount);
        setCompletionCount(newCount);
        clearInterval(interval);
        setTimeout(() => {
          setShowCountdown(false);
          setShowResults(true);
        }, 1500);
      } else {
        setCountdownNumber(current);
      }
    }, 50);
  };

  const results = calculateResults();
  const overallScore = results.length > 0
    ? Math.round((results.reduce((acc, r) => acc + r.score, 0) / (results.length * 5)) * 100)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  if (showCountdown) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Users className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-muted-foreground">Tests completed worldwide</h2>
          <div className="text-8xl font-bold text-primary animate-pulse">
            {countdownNumber.toLocaleString()}
          </div>
          <p className="text-lg text-muted-foreground">Thank you for contributing!</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={teamHealthLogo} alt="TeamHealth" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{completionCount.toLocaleString()} tests completed</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Quick Team Health Check</h1>
            <p className="text-muted-foreground">Here's a snapshot of your team's health across key areas</p>
          </div>

          {/* Overall Score */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <p className="text-muted-foreground mb-2">Overall Team Health Score</p>
              <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
            </div>

            {/* Radar Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={results}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 5]}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    tickCount={6}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Scores */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6">Category Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((r) => (
                <div
                  key={r.category}
                  className="p-4 rounded-xl border border-border"
                  style={{ borderLeftColor: categoryHexColors[r.category], borderLeftWidth: 4 }}
                >
                  <p className="text-sm text-muted-foreground">{r.name}</p>
                  <p className="text-2xl font-bold" style={{ color: categoryHexColors[r.category] }}>
                    {r.score}/5
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-primary/5 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-3">Want a deeper analysis?</h2>
            <p className="text-muted-foreground mb-6">
              Take the full team diagnostic to get detailed insights and actionable recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/diagnostics">
                <Button size="lg" className="gap-2">
                  Take Full Diagnostic <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a
                href="https://lovable.dev/projects/4fe70535-df71-4a4b-b4bb-186623334cff"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg" className="gap-2">
                  View Project <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={teamHealthLogo} alt="TeamHealth" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{completionCount.toLocaleString()} tests completed</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3">Quick Team Health Check</h1>
          <p className="text-muted-foreground">
            Answer 12 quick questions to get a snapshot of your team's health
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{completedCount}/{quickQuestions.length} questions</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quickQuestions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4">
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
                  style={{ backgroundColor: categoryHexColors[question.category] }}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-4">{question.text}</p>
                  <div className="flex flex-wrap gap-2">
                    {ratingLabels.map((label, ratingIndex) => {
                      const rating = ratingIndex + 1;
                      const isSelected = answers[question.id] === rating;
                      return (
                        <button
                          key={rating}
                          onClick={() => handleAnswer(question.id, rating)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={completedCount < quickQuestions.length}
            className="gap-2"
          >
            See Results <ArrowRight className="h-4 w-4" />
          </Button>
          {completedCount < quickQuestions.length && (
            <p className="text-sm text-muted-foreground mt-2">
              Answer all questions to see your results
            </p>
          )}
        </div>

        {/* Link to full project */}
        <div className="mt-12 text-center">
          <a
            href="https://lovable.dev/projects/4fe70535-df71-4a4b-b4bb-186623334cff"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View this project on Lovable
          </a>
        </div>
      </main>
    </div>
  );
};

export default QuickTest;
