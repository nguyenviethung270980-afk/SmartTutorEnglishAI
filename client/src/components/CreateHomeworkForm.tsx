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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";

export function CreateHomeworkForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createHomework = useCreateHomework();

  const form = useForm<HomeworkInput>({
    resolver: zodResolver(api.homework.create.input),
    defaultValues: {
      topic: "",
      difficulty: "Intermediate",
      type: "Multiple Choice",
    },
  });

  async function onSubmit(data: HomeworkInput) {
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
                    className="h-12 rounded-xl bg-white/50 border-2 focus:border-primary/50"
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
                      <SelectTrigger className="h-12 rounded-xl bg-white/50 border-2">
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
                      <SelectTrigger className="h-12 rounded-xl bg-white/50 border-2">
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

          <Button 
            type="submit" 
            disabled={createHomework.isPending}
            className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
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
