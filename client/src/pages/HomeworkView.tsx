import { useEffect, useState, useMemo, useRef } from "react";
import { useRoute, Link, useSearch } from "wouter";
import type { Homework } from "@shared/schema";
import { useHomework } from "@/hooks/use-homework";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, RefreshCcw, Trophy, Target, Star, Timer, Printer, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Question {
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface HomeworkContent {
  questions: Question[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function HomeworkView() {
  const [, params] = useRoute("/homework/:id");
  const homeworkId = params ? parseInt(params.id) : 0;
  const { data: homework, isLoading } = useHomework(homeworkId);
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const isStudentView = searchParams.get('student') === 'true';
  
  // Get settings from database (secure) instead of URL params
  const antiCheatEnabled = homework?.antiCheat ?? false;
  const timerMinutes = homework?.timerMinutes ?? 0;
  const questionLimit = homework?.questionCount ?? 0;
  const { toast } = useToast();

  const [studentName, setStudentName] = useState("");
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60);
  const [startTime] = useState(Date.now());
  const printRef = useRef<HTMLDivElement>(null);

  const homeworkContent = homework?.content as unknown as HomeworkContent;
  const allQuestions = homeworkContent?.questions || [];
  
  const randomizedQuestions = useMemo(() => {
    let questions = shuffleArray(allQuestions);
    if (questionLimit > 0 && questionLimit < questions.length) {
      questions = questions.slice(0, questionLimit);
    }
    return questions.map(q => ({
      ...q,
      options: q.options ? shuffleArray(q.options) : undefined
    }));
  }, [allQuestions, questionLimit]);

  const content = randomizedQuestions;
  const currentQuestion = content[currentQuestionIdx];
  const totalQuestions = content.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Anti-cheat: disable copy/paste/right-click
  useEffect(() => {
    if (!antiCheatEnabled || !examStarted) return;

    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({ title: "Copying is disabled", description: "Anti-cheat mode is active.", variant: "destructive" });
    };
    const preventPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({ title: "Pasting is disabled", description: "Anti-cheat mode is active.", variant: "destructive" });
    };
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const preventSelect = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('copy', preventCopy);
    document.addEventListener('paste', preventPaste);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('selectstart', preventSelect);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('paste', preventPaste);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('selectstart', preventSelect);
    };
  }, [antiCheatEnabled, examStarted, toast]);

  // Timer countdown
  useEffect(() => {
    if (!examStarted || timerMinutes <= 0 || completed) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCompleted(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted, timerMinutes, completed]);

  useEffect(() => {
    setSelectedOption(null);
    setTextAnswer("");
    setIsSubmitted(false);
    setIsCorrect(false);
  }, [currentQuestionIdx]);

  useEffect(() => {
    if (completed && percentage >= 70) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#14b8a6', '#f59e0b', '#22c55e']
      });
    }
  }, [completed, percentage]);

  const submitMutation = useMutation({
    mutationFn: async (data: { homeworkId: number; studentName: string; score: number; totalQuestions: number; percentage: number; answers: boolean[]; timeSpent: number }) => {
      await apiRequest("POST", "/api/submissions", data);
    },
    onSuccess: () => {
      toast({ title: "Results submitted", description: "Your teacher will see your score." });
    },
  });

  useEffect(() => {
    if (completed && isStudentView && studentName) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      submitMutation.mutate({
        homeworkId,
        studentName,
        score,
        totalQuestions,
        percentage,
        answers: answeredQuestions,
        timeSpent,
      });
    }
  }, [completed]);

  const handleCheck = () => {
    let correct = false;
    if (homework?.type === "Multiple Choice") {
      correct = selectedOption === currentQuestion.correctAnswer;
    } else {
      const normalizedInput = textAnswer.trim().toLowerCase();
      const normalizedAnswer = currentQuestion.correctAnswer.trim().toLowerCase();
      correct = normalizedInput === normalizedAnswer;
    }

    if (correct) {
      setScore(prev => prev + 1);
    }
    
    setAnsweredQuestions(prev => [...prev, correct]);
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestionIdx < content.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIdx(0);
    setCompleted(false);
    setIsSubmitted(false);
    setScore(0);
    setAnsweredQuestions([]);
    setTimeLeft(timerMinutes * 60);
    setExamStarted(false);
    setStudentName("");
  };

  const handlePrint = () => {
    window.print();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreMessage = () => {
    if (percentage === 100) return "Perfect Score!";
    if (percentage >= 90) return "Outstanding!";
    if (percentage >= 80) return "Great Job!";
    if (percentage >= 70) return "Good Work!";
    if (percentage >= 60) return "Nice Effort!";
    if (percentage >= 50) return "Keep Practicing!";
    return "Don't Give Up!";
  };

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600 bg-green-100 dark:bg-green-900/30";
    if (percentage >= 60) return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
    if (percentage >= 40) return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
    return "text-red-600 bg-red-100 dark:bg-red-900/30";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-2xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </main>
      </div>
    );
  }

  if (!homework) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">Homework Not Found</h2>
      {!isStudentView && (
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      )}
    </div>
  );

  if (!currentQuestion || content.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
      {!isStudentView && (
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      )}
    </div>
  );

  // Student name entry screen
  if (isStudentView && !examStarted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-lg mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-3xl border shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-2">{homework.topic}</h1>
              <p className="text-muted-foreground">
                {totalQuestions} questions
                {timerMinutes > 0 && ` • ${timerMinutes} minutes`}
              </p>
              {antiCheatEnabled && (
                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-orange-600 dark:text-orange-400">
                  <Shield className="w-4 h-4" />
                  Anti-cheat mode enabled
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Enter your name</label>
                <Input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Your full name"
                  className="h-12"
                  data-testid="input-student-name"
                />
              </div>
              <Button
                onClick={() => setExamStarted(true)}
                disabled={!studentName.trim()}
                className="w-full h-12 text-lg"
                data-testid="button-start-exam"
              >
                Start Exam
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col print:bg-white" ref={printRef}>
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8 md:py-12 flex flex-col">
        <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
          {!isStudentView ? (
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to list
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-primary">
              <Target className="w-5 h-5" />
              <span className="font-medium">{studentName}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            {timerMinutes > 0 && !completed && (
              <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-muted'}`}>
                <Timer className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            )}
            {!completed && (
              <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                {currentQuestionIdx + 1} / {totalQuestions}
              </div>
            )}
            <div className="flex items-center gap-1 text-sm font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4" />
              {score} pts
            </div>
            {!isStudentView && (
              <Button variant="ghost" size="icon" onClick={handlePrint} title="Print exam">
                <Printer className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {!completed && (
          <div className="w-full bg-muted rounded-full h-2 mb-6 print:hidden">
            <motion.div 
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIdx + (isSubmitted ? 1 : 0)) / totalQuestions) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {completed ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card rounded-3xl border shadow-xl"
          >
            <div className={`w-24 h-24 ${getScoreColor()} rounded-full flex items-center justify-center mb-6`}>
              <Trophy className="w-12 h-12" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">{getScoreMessage()}</h2>
            
            {studentName && (
              <p className="text-lg text-muted-foreground mb-2">
                Well done, <span className="font-semibold text-foreground">{studentName}</span>!
              </p>
            )}
            
            <p className="text-muted-foreground mb-6">
              Topic: <span className="text-foreground font-semibold">{homework.topic}</span>
            </p>

            <div className="bg-muted/50 rounded-2xl p-6 mb-8 w-full max-w-sm">
              <div className="text-5xl font-bold mb-2">
                <span className={percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-orange-600' : 'text-red-600'}>
                  {percentage}%
                </span>
              </div>
              <p className="text-muted-foreground">
                {score} out of {totalQuestions} correct
              </p>
              
              <div className="flex justify-center gap-1 mt-4 flex-wrap">
                {answeredQuestions.map((correct, idx) => (
                  <div 
                    key={idx} 
                    className={`w-3 h-3 rounded-full ${correct ? 'bg-green-500' : 'bg-red-400'}`}
                    title={`Question ${idx + 1}: ${correct ? 'Correct' : 'Incorrect'}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4 flex-wrap justify-center print:hidden">
              <Button onClick={handleRestart} variant="outline" className="h-12 px-6">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              {!isStudentView && (
                <Link href="/">
                  <Button className="h-12 px-6 bg-primary hover:bg-primary/90">
                    Create New
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col gap-6">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-center print:text-left">
              {homework.topic}
            </h1>

            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-3xl border shadow-sm p-6 md:p-10 flex-1 flex flex-col print:shadow-none print:border-0"
            >
              <h3 className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                <span className="text-muted-foreground mr-2">Q{currentQuestionIdx + 1}.</span>
                {currentQuestion.question}
              </h3>

              <div className="flex-1">
                {homework.type === "Multiple Choice" ? (
                  <div className="grid gap-3">
                    {currentQuestion.options?.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      let optionClass = "border-2 p-4 rounded-xl text-left transition-all duration-200 ";
                      
                      if (isSubmitted) {
                        if (option === currentQuestion.correctAnswer) {
                          optionClass += "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400 ";
                        } else if (isSelected) {
                          optionClass += "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400 ";
                        } else {
                          optionClass += "border-border opacity-50 ";
                        }
                      } else {
                        if (isSelected) {
                          optionClass += "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary ";
                        } else {
                          optionClass += "border-border hover:border-primary/50 hover:bg-primary/5 ";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isSubmitted}
                          onClick={() => setSelectedOption(option)}
                          className={optionClass}
                          data-testid={`option-${idx}`}
                        >
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0
                              ${isSelected ? 'border-current' : 'border-muted-foreground/30'}
                            `}>
                              {isSelected && <div className="w-3 h-3 rounded-full bg-current" />}
                            </div>
                            <span>{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input
                      placeholder="Type your answer here..."
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      disabled={isSubmitted}
                      className="h-14 text-lg rounded-xl border-2 focus:border-primary/50"
                      data-testid="input-answer"
                    />
                    {isSubmitted && (
                      <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 text-green-800 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border-red-200 text-red-800 dark:text-red-400'}`}>
                        <div className="flex items-center gap-2 font-medium mb-1">
                          {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          {isCorrect ? "Correct!" : "Incorrect"}
                        </div>
                        {!isCorrect && (
                          <p className="ml-7">
                            Correct answer: <span className="font-semibold">{currentQuestion.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <AnimatePresence>
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-6 border-t print:hidden"
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Explanation</h4>
                        <p className="text-muted-foreground leading-relaxed">{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 pt-6 flex justify-end print:hidden">
                {!isSubmitted ? (
                  <Button 
                    onClick={handleCheck}
                    disabled={homework.type === "Multiple Choice" ? !selectedOption : !textAnswer}
                    className="h-12 px-8 rounded-xl font-semibold text-lg bg-primary hover:bg-primary/90"
                    data-testid="button-check"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    className="h-12 px-8 rounded-xl font-semibold text-lg bg-primary hover:bg-primary/90 group"
                    data-testid="button-next"
                  >
                    {currentQuestionIdx < content.length - 1 ? "Next Question" : "See Results"}
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* Print-only full exam view */}
      <div className="hidden print:block p-8">
        <h1 className="text-2xl font-bold mb-2">{homework.topic}</h1>
        <p className="text-gray-600 mb-6">Name: _________________________ Date: _____________</p>
        <div className="space-y-6">
          {content.map((q, idx) => (
            <div key={idx} className="border-b pb-4">
              <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
              {q.options && (
                <div className="ml-4 space-y-1">
                  {q.options.map((opt, optIdx) => (
                    <p key={optIdx}>○ {opt}</p>
                  ))}
                </div>
              )}
              {!q.options && (
                <p className="ml-4 text-gray-500">Answer: _________________________________</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
