import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Link } from "wouter";
import { ArrowLeft, Clock, Trophy, User, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import type { ExamSubmission } from "@shared/schema";

export default function ExamHistory() {
  const { data: submissions, isLoading } = useQuery<ExamSubmission[]>({
    queryKey: ['/api/submissions'],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
          <h1 className="text-3xl font-display font-bold">Exam History</h1>
          <p className="text-muted-foreground mt-2">View all student submissions and scores</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : !submissions || submissions.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-3xl border">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="text-lg font-medium text-muted-foreground">No submissions yet</h3>
            <p className="text-sm text-muted-foreground/80">Student exam results will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-card rounded-2xl p-5 border shadow-sm"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-lg">{sub.studentName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {sub.submittedAt && formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })}
                      </span>
                      {sub.timeSpent && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(sub.timeSpent / 60)}m {sub.timeSpent % 60}s
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${sub.percentage >= 70 ? 'text-green-600' : sub.percentage >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                        {sub.percentage}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sub.score}/{sub.totalQuestions} correct
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
