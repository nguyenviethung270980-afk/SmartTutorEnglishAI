import { Link } from "wouter";
import { useHomeworkList } from "@/hooks/use-homework";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, ChevronRight, Clock, Trash2, LinkIcon, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function HomeworkList() {
  const { data: homeworkList, isLoading } = useHomeworkList();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/homework/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homework'] });
      toast({
        title: "Deleted",
        description: "Homework has been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete homework.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const handleCopyLink = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/homework/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({
      title: "Link copied",
      description: "Share this link with your student.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const sortedList = [...homeworkList].sort((a, b) => 
    new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedList.map((hw) => (
        <div 
          key={hw.id}
          className="group bg-white rounded-2xl p-5 border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        >
          <div className="flex items-center justify-between gap-3">
            <Link 
              href={`/homework/${hw.id}`}
              className="flex-1 min-w-0"
              data-testid={`link-homework-${hw.id}`}
            >
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                  {hw.topic}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
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
            </Link>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => handleCopyLink(e, hw.id)}
                data-testid={`button-copy-link-${hw.id}`}
                title="Copy link to share"
              >
                {copiedId === hw.id ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <LinkIcon className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => handleDelete(e, hw.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-${hw.id}`}
                title="Delete homework"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Link href={`/homework/${hw.id}`}>
                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
