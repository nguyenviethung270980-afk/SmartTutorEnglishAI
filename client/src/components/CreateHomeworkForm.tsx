import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useCreateHomework } from "@/hooks/use-homework";
import { api, type HomeworkInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Loader2, Timer, Shield, Hash } from "lucide-react";
import { z } from "zod";

const formSchema = api.homework.create.input.extend({
  timerMinutes: z.number().min(0).max(180).default(0),
  questionCount: z.number().min(0).max(50).default(0),
  antiCheat: z.boolean().default(false),
});

type FormInput = z.infer<typeof formSchema>;

export function CreateHomeworkForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createHomework = useCreateHomework();

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      difficulty: "Intermediate",
      type: "Multiple Choice",
      timerMinutes: 0,
      questionCount: 0,
      antiCheat: false,
    },
  });

  async function onSubmit(data: FormInput) {
    try {
      const newHomework = await createHomework.mutateAsync(data);
      toast({
        title: "Homework Generated!",
        description: "Your custom exercise is ready.",
      });
      setLocation(`/homework/${newHomework.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="glass-card rounded-3xl p-8 transition-all hover:shadow-2xl hover:shadow-primary/5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Create New Exercise</h2>
        <p className="text-muted-foreground mt-1">AI-powered personalized homework</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What do you want to practice?</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Past Tense Verbs, Space Vocabulary..." 
                    className="h-12 rounded-xl bg-white/50 dark:bg-white/5 border-2 focus:border-primary/50"
                    data-testid="input-topic"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-white/50 dark:bg-white/5 border-2" data-testid="select-difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-white/50 dark:bg-white/5 border-2" data-testid="select-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                      <SelectItem value="Fill in the blanks">Fill in the blanks</SelectItem>
                      <SelectItem value="Short Answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4">EXAM SETTINGS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="timerMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      Timer (minutes)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={180}
                        placeholder="0 = no timer"
                        className="h-12 rounded-xl bg-white/50 dark:bg-white/5 border-2"
                        data-testid="input-timer"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>0 means no time limit</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Question Limit
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={50}
                        placeholder="0 = all questions"
                        className="h-12 rounded-xl bg-white/50 dark:bg-white/5 border-2"
                        data-testid="input-question-count"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>0 means show all questions</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="antiCheat"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 mt-4">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Anti-Cheat Mode
                    </FormLabel>
                    <FormDescription>
                      Disable copy, paste, and right-click during exam
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-anticheat"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={createHomework.isPending}
            className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            data-testid="button-generate"
          >
            {createHomework.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Magic...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Homework
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
