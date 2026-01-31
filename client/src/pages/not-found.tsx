import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-display font-bold text-foreground">
          Page Not Found
        </h1>
        
        <p className="text-muted-foreground text-lg">
          Oops! It seems you've wandered into an unknown chapter. Let's get you back to your studies.
        </p>
        
        <Link href="/">
          <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-lg">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
