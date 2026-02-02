import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DailyQuestion as DailyQuestionType } from "@shared/schema";

export function DailyQuestion() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { data: question, isLoading, error } = useQuery<DailyQuestionType>({
    queryKey: ['/api/daily-question'],
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 border">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-20 w-full mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error || !question) {
    return null;
  }

  const options = question.options as string[] | null;
  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleCheck = () => {
    setShowResult(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Daily Challenge</h3>
          <p className="text-xs text-muted-foreground">{question.topic}</p>
        </div>
        <Sparkles className="w-4 h-4 text-primary ml-auto" />
      </div>

      <p className="text-lg font-medium mb-4">{question.question}</p>

      {options && (
        <div className="space-y-2 mb-4">
          {options.map((option, idx) => {
            let optionClass = "w-full text-left p-3 rounded-xl border-2 transition-all ";
            
            if (showResult) {
              if (option === question.correctAnswer) {
                optionClass += "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400";
              } else if (option === selectedAnswer) {
                optionClass += "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
              } else {
                optionClass += "border-border opacity-50";
              }
            } else {
              if (option === selectedAnswer) {
                optionClass += "border-primary bg-primary/10 text-primary";
              } else {
                optionClass += "border-border hover:border-primary/50 hover:bg-primary/5";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => !showResult && setSelectedAnswer(option)}
                disabled={showResult}
                className={optionClass}
                data-testid={`daily-option-${idx}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4"
          >
            <div className={`flex items-center gap-2 p-3 rounded-xl ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Incorrect. The answer is: {question.correctAnswer}
                  </span>
                </>
              )}
            </div>
            {question.explanation && (
              <p className="text-sm text-muted-foreground mt-2">{question.explanation}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!showResult && (
        <Button
          onClick={handleCheck}
          disabled={!selectedAnswer}
          className="w-full"
          data-testid="button-check-daily"
        >
          Check Answer
        </Button>
      )}
    </motion.div>
  );
}
