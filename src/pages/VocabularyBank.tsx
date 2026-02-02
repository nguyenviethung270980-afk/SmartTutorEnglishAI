import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Link } from "wouter";
import { ArrowLeft, Plus, BookOpen, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { VocabularyWord } from "@shared/schema";

export default function VocabularyBank() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [example, setExample] = useState("");
  const [category, setCategory] = useState("");

  const { data: words, isLoading } = useQuery<VocabularyWord[]>({
    queryKey: ['/api/vocabulary'],
  });

  const addMutation = useMutation({
    mutationFn: async (data: { word: string; definition: string; example?: string; category?: string }) => {
      await apiRequest("POST", "/api/vocabulary", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vocabulary'] });
      setWord("");
      setDefinition("");
      setExample("");
      setCategory("");
      setShowForm(false);
      toast({ title: "Word added", description: "Vocabulary word has been saved." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/vocabulary/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vocabulary'] });
      toast({ title: "Word deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word || !definition) return;
    addMutation.mutate({ word, definition, example: example || undefined, category: category || undefined });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
            <h1 className="text-3xl font-display font-bold">Vocabulary Bank</h1>
            <p className="text-muted-foreground mt-2">Save and manage vocabulary words for your students</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} data-testid="button-add-word">
            <Plus className="w-4 h-4 mr-2" />
            Add Word
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 border mb-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Word</label>
                <Input
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Enter word"
                  required
                  data-testid="input-word"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category (optional)</label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Verbs, Nouns"
                  data-testid="input-category"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Definition</label>
              <Textarea
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="Enter definition"
                required
                data-testid="input-definition"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Example sentence (optional)</label>
              <Textarea
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="Enter example sentence"
                data-testid="input-example"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addMutation.isPending} data-testid="button-save-word">
                {addMutation.isPending ? "Saving..." : "Save Word"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : !words || words.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-3xl border">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="text-lg font-medium text-muted-foreground">No vocabulary words yet</h3>
            <p className="text-sm text-muted-foreground/80">Add words to build your vocabulary bank</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {words.map((w) => (
              <div
                key={w.id}
                className="bg-card rounded-2xl p-5 border shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-lg">{w.word}</h3>
                    {w.category && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md">{w.category}</span>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(w.id)}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    data-testid={`button-delete-word-${w.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2">{w.definition}</p>
                {w.example && (
                  <p className="text-sm text-muted-foreground/80 mt-2 italic">"{w.example}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
