import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Link } from "wouter";
import { ArrowLeft, Coins, Snowflake, Zap, Lightbulb, Shield, PlusCircle, Flame, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserStats, UserPowerup } from "@shared/schema";
import { POWERUPS } from "@shared/schema";

const iconMap: Record<string, any> = {
  snowflake: Snowflake,
  zap: Zap,
  lightbulb: Lightbulb,
  shield: Shield,
  'plus-circle': PlusCircle,
};

export default function Shop() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/stats'],
  });

  const { data: userPowerups, isLoading: powerupsLoading } = useQuery<UserPowerup[]>({
    queryKey: ['/api/powerups'],
  });

  const { data: shopItems, isLoading: shopLoading } = useQuery<typeof POWERUPS[keyof typeof POWERUPS][]>({
    queryKey: ['/api/shop'],
  });

  const buyMutation = useMutation({
    mutationFn: async (powerupId: string) => {
      return apiRequest("POST", "/api/shop/buy", { powerupId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/powerups'] });
      toast({ title: "Purchase successful!", description: "Power-up added to your inventory." });
    },
    onError: (error: Error) => {
      toast({ title: "Purchase failed", description: error.message, variant: "destructive" });
    },
  });

  const getPowerupQuantity = (powerupId: string) => {
    const found = userPowerups?.find(p => p.powerupId === powerupId);
    return found?.quantity || 0;
  };

  const isLoading = statsLoading || powerupsLoading || shopLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold">Power-Up Shop</h1>
              <p className="text-muted-foreground mt-2">Spend your points on useful power-ups</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
              <Coins className="w-6 h-6" />
              <div>
                <div className="text-2xl font-bold">{stats?.points || 0}</div>
                <div className="text-xs opacity-90">Your Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-4 border text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{stats?.currentStreak || 0}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
          <div className="bg-card rounded-2xl p-4 border text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{stats?.longestStreak || 0}</div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
          <div className="bg-card rounded-2xl p-4 border text-center">
            <div className="text-2xl font-bold text-green-600">{stats?.totalCorrect || 0}</div>
            <div className="text-xs text-muted-foreground">Correct Answers</div>
          </div>
          <div className="bg-card rounded-2xl p-4 border text-center">
            <div className="text-2xl font-bold">{stats?.totalAnswered || 0}</div>
            <div className="text-xs text-muted-foreground">Total Answered</div>
          </div>
        </div>

        {/* My Power-ups */}
        {userPowerups && userPowerups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">My Power-ups</h2>
            <div className="flex flex-wrap gap-3">
              {userPowerups.map((up) => {
                const powerup = POWERUPS[up.powerupId as keyof typeof POWERUPS];
                if (!powerup) return null;
                const Icon = iconMap[powerup.icon] || Zap;
                return (
                  <div key={up.id} className="bg-primary/10 text-primary px-4 py-2 rounded-xl flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{powerup.name}</span>
                    <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                      x{up.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Shop Items */}
        <h2 className="text-xl font-semibold mb-4">Available Power-ups</h2>
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {shopItems?.map((item) => {
              const Icon = iconMap[item.icon] || Zap;
              const owned = getPowerupQuantity(item.id);
              const canAfford = (stats?.points || 0) >= item.price;

              return (
                <div
                  key={item.id}
                  className="bg-card rounded-2xl p-6 border flex items-start gap-4"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      {owned > 0 && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                          Owned: {owned}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-yellow-600 font-bold">
                        <Coins className="w-4 h-4" />
                        {item.price}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => buyMutation.mutate(item.id)}
                        disabled={!canAfford || buyMutation.isPending}
                        data-testid={`button-buy-${item.id}`}
                      >
                        {canAfford ? "Buy" : "Not enough points"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
