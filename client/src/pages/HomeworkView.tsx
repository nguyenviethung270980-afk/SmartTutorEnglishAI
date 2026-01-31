import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useHomework } from "@/hooks/use-homework";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface Question {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export default function HomeworkView() {
  const [, params] = useRoute("/homework/:id");
  const homeworkId = params ? parseInt(params.id) : 0;
  const { data: homework, isLoading } = useHomework(homeworkId);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Content type assertion
  const content = homework?.content as unknown as Question[] || [];
  const currentQuestion = content[currentQuestionIdx];

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setTextAnswer("");
    setIsSubmitted(false);
    setIsCorrect(false);
  }, [currentQuestionIdx]);

  // Celebrate on completion
  useEffect(() => {
    if (completed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#14b8a6', '#f59e0b']
      });
    }
  }, [completed]);

  const handleCheck = () => {
    let correct = false;
    if (homework?.type === "Multiple Choice") {
      correct = selectedOption === currentQuestion.answer;
    } else {
      // Basic text matching, ignoring case and whitespace
      const normalizedInput = textAnswer.trim().toLowerCase();
      const normalizedAnswer = currentQuestion.answer.trim().toLowerCase();
      correct = normalizedInput === normalizedAnswer;
    }

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
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container max-w-3xl mx-auto px-4 py-12 flex flex-col">
        {/* Back Link & Progress */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to list
          </Link>
          <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Question {currentQuestionIdx + 1} of {content.length}
          </div>
        </div>

        {completed ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border shadow-xl"
          >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-2">Excellent Work!</h2>
            <p className="text-muted-foreground mb-8 text-lg">You've completed the exercise on <span className="text-foreground font-semibold">{homework.topic}</span>.</p>
            <div className="flex gap-4">
              <Button onClick={handleRestart} variant="outline" className="h-12 px-6">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link href="/">
                <Button className="h-12 px-6 bg-primary hover:bg-primary/90">
                  Create New
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col gap-6">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
              {homework.topic}
            </h1>

            {/* Question Card */}
            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl border shadow-sm p-6 md:p-10 flex-1 flex flex-col"
            >
              <h3 className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                {currentQuestion.question}
              </h3>

              <div className="flex-1">
                {homework.type === "Multiple Choice" ? (
                  <div className="grid gap-3">
                    {currentQuestion.options?.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      let optionClass = "border-2 p-4 rounded-xl text-left transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ";
                      
                      if (isSubmitted) {
                        if (option === currentQuestion.answer) optionClass += "bg-green-50 border-green-500 text-green-700 ";
                        else if (isSelected) optionClass += "bg-red-50 border-red-500 text-red-700 ";
                        else optionClass += "border-border opacity-60 ";
                      } else {
                        if (isSelected) optionClass += "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary ";
                        else optionClass += "border-border ";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isSubmitted}
                          onClick={() => setSelectedOption(option)}
                          className={optionClass}
                        >
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center
                              ${isSelected ? 'border-current' : 'border-muted-foreground/30'}
                            `}>
                              {isSelected && <div className="w-3 h-3 rounded-full bg-current" />}
                            </div>
                            {option}
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
                    />
                    {isSubmitted && (
                      <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <div className="flex items-center gap-2 font-medium mb-1">
                          {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          {isCorrect ? "Correct!" : "Incorrect"}
                        </div>
                        {!isCorrect && (
                          <p className="ml-7">
                            Correct answer: <span className="font-semibold">{currentQuestion.answer}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Feedback Section */}
              <AnimatePresence>
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-6 border-t"
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">
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

              {/* Actions */}
              <div className="mt-8 pt-6 flex justify-end">
                {!isSubmitted ? (
                  <Button 
                    onClick={handleCheck}
                    disabled={homework.type === "Multiple Choice" ? !selectedOption : !textAnswer}
                    className="h-12 px-8 rounded-xl font-semibold text-lg bg-primary hover:bg-primary/90"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    className="h-12 px-8 rounded-xl font-semibold text-lg bg-primary hover:bg-primary/90 group"
                  >
                    {currentQuestionIdx < content.length - 1 ? "Next Question" : "Finish Exercise"}
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
