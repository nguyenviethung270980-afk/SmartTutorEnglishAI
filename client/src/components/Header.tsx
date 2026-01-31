import { Link } from "wouter";
import { GraduationCap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground transform group-hover:rotate-12 transition-transform duration-300">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            SmartTutor<span className="text-primary">.ai</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
