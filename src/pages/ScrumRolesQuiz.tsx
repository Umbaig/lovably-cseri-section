import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import teamHealthLogo from "@/assets/teamhealth-logo.png";

type Role = "Product Owner" | "Scrum Master" | "The Team";

interface Question {
  id: number;
  statement: string;
  correctAnswer: Role;
}

const allQuestions: Question[] = [
  // Product Owner questions
  { id: 1, statement: "Establishment of a clear product vision.", correctAnswer: "Product Owner" },
  { id: 2, statement: "Insurance that the Product Backlog is visible, transparent, and clear to all.", correctAnswer: "Product Owner" },
  { id: 3, statement: "Ensures transparency into the upcoming work of the cross-functional team.", correctAnswer: "Product Owner" },
  { id: 4, statement: "Monitors the results achieved such as business goals and KPIs.", correctAnswer: "Product Owner" },
  { id: 5, statement: "Makes decisions regarding the priority of product backlog items to deliver maximum outcome with minimum input.", correctAnswer: "Product Owner" },
  { id: 6, statement: "Defining and explicitly communicating the Product Goal.", correctAnswer: "Product Owner" },
  { id: 7, statement: "Ordering Product Backlog items to best achieve goals and missions.", correctAnswer: "Product Owner" },
  { id: 8, statement: "Optimizing the value of the work the Scrum Team performs.", correctAnswer: "Product Owner" },
  { id: 9, statement: "Representing the needs of many stakeholders in the Product Backlog.", correctAnswer: "Product Owner" },
  { id: 10, statement: "Deciding when to release the product increment to the market.", correctAnswer: "Product Owner" },
  
  // Scrum Master questions
  { id: 11, statement: "Builds and maintains a healthy and motivated team.", correctAnswer: "Scrum Master" },
  { id: 12, statement: "Responsible for adhering to the Agile framework and Scrum methodology.", correctAnswer: "Scrum Master" },
  { id: 13, statement: "Consistently improves and reports team productivity without focusing on content.", correctAnswer: "Scrum Master" },
  { id: 14, statement: "Facilitates Daily Standup and Sprint Retrospective meetings.", correctAnswer: "Scrum Master" },
  { id: 15, statement: "Assists the team in achieving its goals by helping members communicate and coordinate.", correctAnswer: "Scrum Master" },
  { id: 16, statement: "Leads the continuous improvement process on team performance.", correctAnswer: "Scrum Master" },
  { id: 17, statement: "Facilitates a healthy intra-team dynamic with respect to priorities and scope.", correctAnswer: "Scrum Master" },
  { id: 18, statement: "Protects the team from interference from others.", correctAnswer: "Scrum Master" },
  { id: 19, statement: "Executes items on the Vision and Product Backlog by achieving goals and escalating impediments.", correctAnswer: "Scrum Master" },
  { id: 20, statement: "Establishing Scrum as defined in the Scrum Guide.", correctAnswer: "Scrum Master" },
  { id: 21, statement: "Causing the removal of impediments to the Scrum Team's progress.", correctAnswer: "Scrum Master" },
  { id: 22, statement: "Coaching the team in self-management and cross-functionality.", correctAnswer: "Scrum Master" },
  
  // The Team (Developers) questions
  { id: 23, statement: "Develop and test the highest priority Product Backlog items.", correctAnswer: "The Team" },
  { id: 24, statement: "Estimate Product Backlog entries.", correctAnswer: "The Team" },
  { id: 25, statement: "Plans the team's work.", correctAnswer: "The Team" },
  { id: 26, statement: "Has the authority and empowerment to ensure the work can be done to achieve the goals.", correctAnswer: "The Team" },
  { id: 27, statement: "Adheres to the segregation of duties, such as ensuring the person who writes code does not deploy it alone.", correctAnswer: "The Team" },
  { id: 28, statement: "Contribute to architecture and design decisions.", correctAnswer: "The Team" },
  { id: 29, statement: "Creating a plan for the Sprint (the Sprint Backlog).", correctAnswer: "The Team" },
  { id: 30, statement: "Instilling quality by adhering to a \"Definition of Done.\"", correctAnswer: "The Team" },
  { id: 31, statement: "Adapting their plan each day toward the Sprint Goal during the Daily Scrum.", correctAnswer: "The Team" },
];

const roles: Role[] = ["Scrum Master", "Product Owner", "The Team"];

const QUIZ_SIZE = 15; // Number of questions per quiz

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const selectBalancedQuestions = (): Question[] => {
  // Get questions for each role
  const poQuestions = allQuestions.filter(q => q.correctAnswer === "Product Owner");
  const smQuestions = allQuestions.filter(q => q.correctAnswer === "Scrum Master");
  const teamQuestions = allQuestions.filter(q => q.correctAnswer === "The Team");
  
  // Shuffle each group
  const shuffledPO = shuffleArray(poQuestions);
  const shuffledSM = shuffleArray(smQuestions);
  const shuffledTeam = shuffleArray(teamQuestions);
  
  // Take 5 from each role to get 15 total
  const selected = [
    ...shuffledPO.slice(0, 5),
    ...shuffledSM.slice(0, 5),
    ...shuffledTeam.slice(0, 5),
  ];
  
  // Shuffle the final selection
  return shuffleArray(selected);
};

const ScrumRolesQuiz = () => {
  const [questions, setQuestions] = useState<Question[]>(() => selectBalancedQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Role>>({});
  const [showResult, setShowResult] = useState<boolean>(false);
  const [showQuizComplete, setShowQuizComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (selectedRole: Role) => {
    const isCorrect = selectedRole === currentQuestion.correctAnswer;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedRole }));
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setQuestions(selectBalancedQuestions());
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setShowQuizComplete(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return "Excellent! You're a Scrum expert!";
    if (percentage >= 70) return "Great job! You have a solid understanding of Scrum roles.";
    if (percentage >= 50) return "Good effort! Consider reviewing the Scrum Guide for clarity.";
    return "Keep learning! The Scrum Guide is a great resource to improve.";
  };

  if (showQuizComplete) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="bg-white border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={teamHealthLogo} alt="TeamHealth" className="h-8 w-auto" />
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h1>
            <p className="text-muted-foreground mb-8">{getScoreMessage(score, questions.length)}</p>
            
            <div className="mb-8">
              <div className="text-6xl font-bold text-primary mb-2">{score}/{questions.length}</div>
              <p className="text-lg text-muted-foreground">{percentage}% correct</p>
            </div>

            <div className="space-y-4">
              <Button onClick={handleRestart} size="lg" className="gap-2 w-full sm:w-auto">
                <RotateCcw className="h-4 w-4" /> Try Again
              </Button>
              <div>
                <Link to="/">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Review answers */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6">Review Your Answers</h2>
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <div 
                    key={q.id} 
                    className={`p-4 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-foreground mb-1">{idx + 1}. {q.statement}</p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Your answer: </span>
                          <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>{userAnswer}</span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Correct answer: </span>
                            <span className="text-green-700">{q.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={teamHealthLogo} alt="TeamHealth" className="h-8 w-auto" />
          </Link>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Roles & Responsibilities in Scrum
          </h1>
          <p className="text-muted-foreground">
            Who is responsible for this? Select the correct Scrum role.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <p className="text-lg md:text-xl font-medium text-foreground text-center mb-8">
            "{currentQuestion.statement}"
          </p>

          <div className="grid gap-3">
            {roles.map((role) => {
              const isSelected = answers[currentQuestion.id] === role;
              const isCorrect = role === currentQuestion.correctAnswer;
              
              let buttonClass = "w-full py-4 px-6 text-left rounded-xl border-2 transition-all font-medium ";
              
              if (showResult) {
                if (isCorrect) {
                  buttonClass += "border-green-500 bg-green-50 text-green-800";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-50 text-red-800";
                } else {
                  buttonClass += "border-border bg-muted/30 text-muted-foreground";
                }
              } else {
                buttonClass += "border-border hover:border-primary hover:bg-primary/5 text-foreground";
              }

              return (
                <button
                  key={role}
                  onClick={() => !showResult && handleAnswer(role)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{role}</span>
                    {showResult && isCorrect && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Result feedback & Next button */}
        {showResult && (
          <div className="text-center animate-fade-in">
            <div className={`mb-4 p-4 rounded-lg ${
              answers[currentQuestion.id] === currentQuestion.correctAnswer 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {answers[currentQuestion.id] === currentQuestion.correctAnswer 
                ? "Correct! Well done!" 
                : `Incorrect. The correct answer is ${currentQuestion.correctAnswer}.`}
            </div>
            <Button onClick={handleNext} size="lg" className="gap-2">
              {currentIndex < questions.length - 1 ? (
                <>Next Question <ArrowRight className="h-4 w-4" /></>
              ) : (
                <>See Results <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScrumRolesQuiz;
