import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, X, Plus, Loader2, RotateCcw, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const DEFAULT_CRITERIA = [
  "Delivery",
  "Trust",
  "Leadership",
  "Value",
  "Collaboration",
  "Ownership",
];

interface AnalysisResult {
  summary: string;
  overallScore: number;
  scores: Record<string, { score: number; explanation: string }>;
  strengths: string[];
  improvements: string[];
}

const MeetingVibeCheck = () => {
  const [criteria, setCriteria] = useState<string[]>(DEFAULT_CRITERIA);
  const [newCriterion, setNewCriterion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const recognitionRef = useRef<InstanceType<typeof window.SpeechRecognition> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Browser not supported",
        description: "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setPermissionDenied(true);
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to record your meeting.",
          variant: "destructive",
        });
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (isRecording) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording, toast]);

  const toggleRecording = async () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not available",
        description: "Speech recognition is not available in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionDenied(false);
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        setPermissionDenied(true);
        toast({
          title: "Microphone access required",
          description: "Please allow microphone access to record your meeting.",
          variant: "destructive",
        });
      }
    }
  };

  const addCriterion = () => {
    const trimmed = newCriterion.trim();
    if (trimmed && !criteria.includes(trimmed)) {
      setCriteria([...criteria, trimmed]);
      setNewCriterion("");
    }
  };

  const removeCriterion = (criterion: string) => {
    setCriteria(criteria.filter((c) => c !== criterion));
  };

  const analyzeTranscript = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No transcript",
        description: "Please record or enter a meeting transcript first.",
        variant: "destructive",
      });
      return;
    }

    if (criteria.length === 0) {
      toast({
        title: "No criteria",
        description: "Please add at least one evaluation criterion.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-meeting", {
        body: { transcript, criteria },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data);
      toast({
        title: "Analysis complete",
        description: "Your meeting vibe check is ready!",
      });
    } catch (err) {
      console.error("Analysis error:", err);
      toast({
        title: "Analysis failed",
        description: err instanceof Error ? err.message : "Failed to analyze the transcript.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setTranscript("");
  };

  const getRadarData = () => {
    if (!analysisResult?.scores) return [];
    return Object.entries(analysisResult.scores).map(([key, value]) => ({
      criterion: key,
      score: value.score,
      fullMark: 10,
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Meeting Vibe Check</h1>
            <p className="text-muted-foreground text-lg">
              AI-powered team meeting analysis
            </p>
          </div>

          {!analysisResult ? (
            <>
              {/* Recording Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Record Meeting</CardTitle>
                  <CardDescription>
                    Click the microphone to start recording or paste your transcript below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      variant={isRecording ? "destructive" : "default"}
                      className={`rounded-full h-20 w-20 ${isRecording ? "animate-pulse" : ""}`}
                      onClick={toggleRecording}
                      disabled={permissionDenied}
                    >
                      {isRecording ? (
                        <MicOff className="h-8 w-8" />
                      ) : (
                        <Mic className="h-8 w-8" />
                      )}
                    </Button>
                  </div>
                  {isRecording && (
                    <p className="text-center text-sm text-muted-foreground">
                      Recording... Speak clearly into your microphone
                    </p>
                  )}
                  {permissionDenied && (
                    <p className="text-center text-sm text-destructive">
                      Microphone access was denied. Please enable it in your browser settings.
                    </p>
                  )}
                  <textarea
                    className="w-full min-h-[200px] p-4 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Your transcript will appear here, or paste your meeting transcript..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                  />
                </CardContent>
              </Card>

              {/* Criteria Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Evaluation Criteria</CardTitle>
                  <CardDescription>
                    Customize the tags to evaluate your team's performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {criteria.map((criterion) => (
                      <Badge
                        key={criterion}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => removeCriterion(criterion)}
                      >
                        {criterion}
                        <X className="ml-2 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new criterion..."
                      value={newCriterion}
                      onChange={(e) => setNewCriterion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCriterion()}
                    />
                    <Button variant="outline" onClick={addCriterion}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analyze Button */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={analyzeTranscript}
                  disabled={isAnalyzing || !transcript.trim()}
                  className="px-8"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Meeting"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Results Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-medium">Analysis Results</CardTitle>
                      <CardDescription>{analysisResult.summary}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                        {analysisResult.overallScore}/10
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={getRadarData()}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis
                          dataKey="criterion"
                          tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 10]}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Scores */}
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(analysisResult.scores).map(([criterion, data]) => (
                  <Card key={criterion}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{criterion}</h4>
                        <span className={`text-xl font-bold ${getScoreColor(data.score)}`}>
                          {data.score}/10
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{data.explanation}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Strengths & Improvements */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-accent-foreground" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.improvements.map((improvement, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-accent-foreground">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Reset Button */}
              <div className="flex justify-center">
                <Button variant="outline" onClick={resetAnalysis}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start New Analysis
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingVibeCheck;
