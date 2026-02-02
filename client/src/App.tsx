import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import HomeworkView from "@/pages/HomeworkView";
import ExamHistory from "@/pages/ExamHistory";
import VocabularyBank from "@/pages/VocabularyBank";
import Shop from "@/pages/Shop";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/homework/:id" component={HomeworkView} />
      <Route path="/history" component={ExamHistory} />
      <Route path="/vocabulary" component={VocabularyBank} />
      <Route path="/shop" component={Shop} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
