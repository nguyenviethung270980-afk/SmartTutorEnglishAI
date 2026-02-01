import { Header } from "@/components/Header";
import { CreateHomeworkForm } from "@/components/CreateHomeworkForm";
import { HomeworkList } from "@/components/HomeworkList";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              SmartTutor<span className="text-primary">.ai</span>
            </span>
          </div>
          <a href="/api/login">
            <Button data-testid="button-login">Sign In</Button>
          </a>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-32">
          <div className="container max-w-5xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Homework Generator
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
                Create Engaging English<br />
                <span className="text-primary">Homework in Seconds</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Generate custom quizzes, vocabulary tests, and grammar exercises with AI. 
                Share with students and track their progress effortlessly.
              </p>
              <a href="/api/login">
                <Button size="lg" className="h-14 px-8 text-lg" data-testid="button-get-started">
                  Get Started Free
                </Button>
              </a>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-12">
              Everything You Need to Teach Better
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-6 border"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI Question Generation</h3>
                <p className="text-muted-foreground">
                  Create multiple choice, fill-in-the-blank, and essay questions on any topic instantly.
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl p-6 border"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Easy Student Sharing</h3>
                <p className="text-muted-foreground">
                  Share exam links with students. No signup required for them to take the test.
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl p-6 border"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Anti-Cheat Mode</h3>
                <p className="text-muted-foreground">
                  Timer, randomized questions, and disabled copy-paste keep exams fair.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Ready to Transform Your Teaching?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of teachers creating better homework with AI.
            </p>
            <a href="/api/login">
              <Button size="lg" data-testid="button-sign-up">
                Sign Up Now
              </Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SmartTutor.ai. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight text-foreground leading-[1.1]">
                Master English with <br />
                <span className="text-gradient">Personalized AI</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Generate unlimited practice exercises tailored exactly to your level and interests. Learning English has never been this smart.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-display">Recent Exercises</h2>
              </div>
              <HomeworkList />
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="sticky top-24"
            >
              <CreateHomeworkForm />
              
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <Dashboard />;
}
