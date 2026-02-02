import { Link, useLocation } from "wouter";
import { GraduationCap, History, BookOpen, LogOut, User, ShoppingBag, Coins } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { UserStats } from "@shared/schema";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export function Header() {
  const [location] = useLocation();
  const isStudentView = location.includes('student=true');
  const { user } = useAuth();

  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/stats'],
    enabled: !!user,
  });

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
          {!isStudentView && user && (
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
              <Link href="/shop">
                <Button variant="ghost" size="sm" data-testid="link-shop">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Shop</span>
                  {stats && (
                    <span className="ml-1 flex items-center gap-0.5 text-yellow-600 dark:text-yellow-400">
                      <Coins className="w-3 h-3" />
                      {stats.points || 0}
                    </span>
                  )}
                </Button>
              </Link>
            </>
          )}
          <ThemeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    {user.profileImageUrl ? (
                      <AvatarImage src={user.profileImageUrl} alt={user.firstName || 'User'} />
                    ) : null}
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="cursor-pointer" data-testid="button-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
