import { Link } from "wouter";
import { useHomeworkList } from "@/hooks/use-homework";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, ChevronRight, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function HomeworkList() {
  const { data: homeworkList, isLoading } = useHomeworkList();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!homeworkList || homeworkList.length === 0) {
    return (
      <div className="text-center py-12 bg-white/30 rounded-3xl border border-dashed border-border/50">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <h3 className="text-lg font-medium text-muted-foreground">No homework yet</h3>
        <p className="text-sm text-muted-foreground/80">Create your first exercise above!</p>
      </div>
    );
  }

  // Sort by newest first
  const sortedList = [...homeworkList].sort((a, b) => 
    new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedList.map((hw) => (
        <Link 
          key={hw.id} 
          href={`/homework/${hw.id}`}
          className="group block bg-white rounded-2xl p-5 border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {hw.topic}
              </h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className={`
                  px-2 py-0.5 rounded-md text-xs font-medium
                  ${hw.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' : 
                    hw.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700' : 
                    'bg-orange-100 text-orange-700'}
                `}>
                  {hw.difficulty}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {hw.createdAt && formatDistanceToNow(new Date(hw.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
