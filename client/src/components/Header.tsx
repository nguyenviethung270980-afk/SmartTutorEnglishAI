import { Link, useLocation } from "wouter";
import { GraduationCap, History, BookOpen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

export function Header() {
  const [location] = useLocation();
  const isStudentView = location.includes('student=true');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground transform group-hover:rotate-12 transition-transform duration-300">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            SmartTutor<span className="text-primary">.ai</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {!isStudentView && (
            <>
              <Link href="/history">
                <Button variant="ghost" size="sm" data-testid="link-history">
                  <History className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              </Link>
              <Link href="/vocabulary">
                <Button variant="ghost" size="sm" data-testid="link-vocabulary">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Vocabulary</span>
                </Button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
