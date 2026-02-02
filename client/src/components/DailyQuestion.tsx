import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle2, XCircle, Sparkles, Flame, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DailyQuestion as DailyQuestionType, UserStats } from "@shared/schema";

export function DailyQuestion() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const { data: question, isLoading, error } = useQuery<DailyQuestionType>({
    queryKey: ['/api/daily-question'],
  });

  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/stats'],
  });

  const answerMutation = useMutation({
    mutationFn: async (answer: string) => {
      const res = await apiRequest("POST", `/api/daily-question/${question?.id}/answer`, { answer });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-question'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
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
  const isAnswered = question.answered;
  const isCorrect = question.answeredCorrectly;
  const showResult = isAnswered || answerMutation.isSuccess;
  const resultData = answerMutation.data;

  const handleCheck = () => {
    if (selectedAnswer && !isAnswered) {
      answerMutation.mutate(selectedAnswer);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Daily Challenge</h3>
            <p className="text-xs text-muted-foreground">{question.topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stats && stats.currentStreak > 0 && (
            <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
              <Flame className="w-4 h-4" />
              {stats.currentStreak} day streak
            </div>
          )}
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      </div>

      <p className="text-lg font-medium mb-4">{question.question}</p>

      {options && (
        <div className="space-y-2 mb-4">
          {options.map((option, idx) => {
            let optionClass = "w-full text-left p-3 rounded-xl border-2 transition-all ";
            const correctAnswer = resultData?.correctAnswer || (isAnswered && isCorrect ? selectedAnswer : null);
            
            if (showResult || isAnswered) {
              if (option === (resultData?.correctAnswer || question.correctAnswer)) {
                optionClass += "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400";
              } else if (option === selectedAnswer && !(resultData?.correct || isCorrect)) {
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
                onClick={() => !showResult && !isAnswered && setSelectedAnswer(option)}
                disabled={showResult || isAnswered}
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
        {(showResult || isAnswered) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4"
          >
            <div className={`flex items-center justify-between gap-2 p-3 rounded-xl ${(resultData?.correct || isCorrect) ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
              <div className="flex items-center gap-2">
                {(resultData?.correct || isCorrect) ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Incorrect
                    </span>
                  </>
                )}
              </div>
              {resultData?.pointsEarned > 0 && (
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-lg text-sm font-medium">
                  <Coins className="w-4 h-4" />
                  +{resultData.pointsEarned} points
                </div>
              )}
            </div>
            {(resultData?.explanation || question.explanation) && (
              <p className="text-sm text-muted-foreground mt-2">{resultData?.explanation || question.explanation}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!showResult && !isAnswered && (
        <Button
          onClick={handleCheck}
          disabled={!selectedAnswer || answerMutation.isPending}
          className="w-full"
          data-testid="button-check-daily"
        >
          {answerMutation.isPending ? "Checking..." : "Check Answer"}
        </Button>
      )}

      {(showResult || isAnswered) && (
        <p className="text-center text-sm text-muted-foreground">
          Come back tomorrow for a new challenge!
        </p>
      )}
    </motion.div>
  );
}
