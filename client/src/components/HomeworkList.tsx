import { Link } from "wouter";
import { useHomeworkList } from "@/hooks/use-homework";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, ChevronRight, Clock, Trash2, LinkIcon, Check, Settings, Timer, Shield, Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Homework } from "@shared/schema";

export function HomeworkList() {
  const { data: homeworkList, isLoading } = useHomeworkList();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [editingSettings, setEditingSettings] = useState<{ [key: number]: { timer: number; questions: number; antiCheat: boolean } }>({});

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

  const getSettings = (hw: Homework) => {
    return editingSettings[hw.id] || {
      timer: hw.timerMinutes || 0,
      questions: hw.questionCount || 0,
      antiCheat: hw.antiCheat || false,
    };
  };

  const updateSettings = (id: number, key: string, value: number | boolean) => {
    setEditingSettings(prev => ({
      ...prev,
      [id]: {
        ...getSettings(homeworkList?.find(h => h.id === id)!),
        [key]: value,
      },
    }));
  };

  const handleCopyLink = (hw: Homework) => {
    // Simple secure link - settings come from database
    const url = `${window.location.origin}/homework/${hw.id}?student=true`;
    
    navigator.clipboard.writeText(url);
    setCopiedId(hw.id);
    toast({
      title: "Student link copied",
      description: "Settings are stored securely. Students cannot modify them.",
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
      <div className="text-center py-12 bg-card rounded-3xl border border-dashed">
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
      {sortedList.map((hw) => {
        const settings = getSettings(hw);
        return (
          <div 
            key={hw.id}
            className="group bg-card rounded-2xl p-5 border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
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
                      ${hw.difficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                        hw.difficulty === 'Intermediate' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 
                        'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}
                    `}>
                      {hw.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {hw.createdAt && formatDistanceToNow(new Date(hw.createdAt), { addSuffix: true })}
                    </span>
                    {(hw.timerMinutes ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded">
                        <Timer className="w-3 h-3" />
                        {hw.timerMinutes}m
                      </span>
                    )}
                    {hw.antiCheat && (
                      <span className="flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded">
                        <Shield className="w-3 h-3" />
                        Secure
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      data-testid={`button-share-settings-${hw.id}`}
                      title="Share with options"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="end">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Exam Settings</h4>
                      <p className="text-xs text-muted-foreground">
                        Settings are stored in the database. Students cannot modify them via the link.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm flex items-center gap-2">
                            <Timer className="w-4 h-4" />
                            Timer: {hw.timerMinutes || 0} minutes
                          </Label>
                        </div>
                        <div>
                          <Label className="text-sm flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Question limit: {hw.questionCount || 'All'}
                          </Label>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Anti-cheat: {hw.antiCheat ? 'On' : 'Off'}
                          </Label>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleCopyLink(hw)} 
                        className="w-full"
                        data-testid={`button-copy-configured-link-${hw.id}`}
                      >
                        {copiedId === hw.id ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Copy Secure Link
                          </>
                        )}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
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
        );
      })}
    </div>
  );
}
