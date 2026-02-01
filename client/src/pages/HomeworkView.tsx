import { useEffect, useState } from "react";
import { useRoute, Link, useSearch } from "wouter";
import { useHomework } from "@/hooks/use-homework";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, RefreshCcw, Trophy, Target, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface Question {
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface HomeworkContent {
  questions: Question[];
}

export default function HomeworkView() {
  const [, params] = useRoute("/homework/:id");
  const homeworkId = params ? parseInt(params.id) : 0;
  const { data: homework, isLoading } = useHomework(homeworkId);
  const searchString = useSearch();
  const isStudentView = new URLSearchParams(searchString).get('student') === 'true';

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);

  const homeworkContent = homework?.content as unknown as HomeworkContent;
  const content = homeworkContent?.questions || [];
  const currentQuestion = content[currentQuestionIdx];
  const totalQuestions = content.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

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
    if (percentage >= 80) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-blue-600 bg-blue-100";
    if (percentage >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8 md:py-12 flex flex-col">
        <div className="mb-6 flex items-center justify-between gap-4">
          {!isStudentView ? (
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to list
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-primary">
              <Target className="w-5 h-5" />
              <span className="font-medium">Practice Mode</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            {!completed && (
              <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                {currentQuestionIdx + 1} / {totalQuestions}
              </div>
            )}
            <div className="flex items-center gap-1 text-sm font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4" />
              {score} pts
            </div>
          </div>
        </div>

        {!completed && (
          <div className="w-full bg-muted rounded-full h-2 mb-6">
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
            className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-card rounded-3xl border shadow-xl"
          >
            <div className={`w-24 h-24 ${getScoreColor()} rounded-full flex items-center justify-center mb-6`}>
              <Trophy className="w-12 h-12" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">{getScoreMessage()}</h2>
            
            <p className="text-muted-foreground mb-6 text-lg">
              You completed <span className="text-foreground font-semibold">{homework.topic}</span>
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
              
              <div className="flex justify-center gap-1 mt-4">
                {answeredQuestions.map((correct, idx) => (
                  <div 
                    key={idx} 
                    className={`w-3 h-3 rounded-full ${correct ? 'bg-green-500' : 'bg-red-400'}`}
                    title={`Question ${idx + 1}: ${correct ? 'Correct' : 'Incorrect'}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4 flex-wrap justify-center">
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
            <h1 className="text-2xl md:text-3xl font-display font-bold text-center">
              {homework.topic}
            </h1>

            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-card rounded-3xl border shadow-sm p-6 md:p-10 flex-1 flex flex-col"
            >
              <h3 className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
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
                    className="mt-6 pt-6 border-t"
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

              <div className="mt-8 pt-6 flex justify-end">
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
