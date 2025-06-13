import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Star, Zap, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { badgeService } from "@/services/badgeService";
import Navigation from "@/components/Navigation";
import type { FrontendBadge } from "../types";
import { getBadgeRarity, rarityColors } from "@/utils/badgesUtils";


interface BadgeWithRarity extends FrontendBadge {
  rarity: keyof typeof rarityColors;
}

export default function ProgressPage() {
  const navigate = useNavigate();
  const user = useUserStore();
  const [userBadges, setUserBadges] = useState<FrontendBadge[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeWithRarity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    const loadBadges = async () => {
      try {
        setLoading(true);
        setError(null);

        const [allBadgesData, userBadgesData] = await Promise.all([
          badgeService.getAllBadges(),
          badgeService.getUserBadges(),
        ]);

        // Add rarity to badges (you can modify this based on your badge data structure)
        const badgesWithRarity: BadgeWithRarity[] = allBadgesData.map((badge) => ({
          ...badge,
          rarity: getBadgeRarity(badge),
        }));

        setAllBadges(badgesWithRarity);
        setUserBadges(userBadgesData);
      } catch (err) {
        console.error("Failed to load badges:", err);
        setError("Failed to load progress data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadBadges();
    }
  }, [user]);



  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-4 pb-20">
        <div className="flex items-center justify-center h-64">
          <div className="text-purple-600">Loading progress...</div>
        </div>
        <Navigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-4 pb-20">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
              Try Again
            </Button>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  // Calculate XP progress for current level
  const currentLevel = user.level || 1;
  const currentXP = user.experience || 0;
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpProgressInLevel = currentXP - xpForCurrentLevel;
  const xpNeededForNextLevel = Math.max(0, xpForNextLevel - currentXP);
  const progressPercentage = Math.min(100, (xpProgressInLevel / 100) * 100);
  const userBadgeIds = userBadges.map(badge => badge.id);
  const earnedBadges = allBadges.filter((badge) => userBadgeIds.includes(badge.id));
//   const lockedBadges = allBadges.filter((badge) => !userBadgeIds.includes(badge.id));

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-4 pb-20">
        <header className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate("/profile")} className="mr-2 p-2">
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </Button>
          <h1 className="text-2xl font-bold text-purple-800">Progress</h1>
        </header>

        {/* Level Progress Card */}
        <Card className="mb-6 overflow-hidden border-none shadow-lg">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Level {currentLevel}</h2>
                <p className="text-purple-200">Keep pushing your limits!</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <Star className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{Math.max(0, xpProgressInLevel)} / 100 XP</span>
                <span>{xpNeededForNextLevel} XP to next level</span>
              </div>
              <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-purple-50 p-4 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-800">{currentXP}</div>
                <div className="text-xs text-purple-600">Total XP</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-800">{earnedBadges.length}</div>
                <div className="text-xs text-purple-600">Badges Earned</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-800">{currentLevel}</div>
                <div className="text-xs text-purple-600">Current Level</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Badges Collection
            </CardTitle>
            <p className="text-sm text-purple-600">
              {earnedBadges.length} of {allBadges.length} badges earned
            </p>
          </CardHeader>
        </Card>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="grid grid-cols-2 w-full bg-purple-50">
            <TabsTrigger value="all" className="data-[state=active]:bg-white">
              All Badges
            </TabsTrigger>
            <TabsTrigger value="earned" className="data-[state=active]:bg-white">
              My Badges ({earnedBadges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allBadges.map((badge) => {
                const isEarned = userBadgeIds.includes(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        isEarned ? "border-green-200 bg-green-50 shadow-md" : "border-gray-200 bg-gray-50 opacity-75",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "relative w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                              isEarned ? "bg-white shadow-sm" : "bg-gray-200",
                            )}
                          >
                            {isEarned ? badge.icon : <Lock className="w-6 h-6 text-gray-400" />}
                            {isEarned && (
                              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={cn("font-semibold truncate", isEarned ? "text-gray-900" : "text-gray-500")}>
                                {badge.name}
                              </h3>
                              <Badge className={cn("text-xs", rarityColors[badge.rarity])}>
                                {badge.rarity}
                              </Badge>
                            </div>
                            <p className={cn("text-sm", isEarned ? "text-gray-600" : "text-gray-400")}>
                              {badge.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="earned" className="mt-4">
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {earnedBadges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden border-green-200 bg-green-50 shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="relative w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl">
                            {badge.icon}
                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">{badge.name}</h3>
                              <Badge className={cn("text-xs", rarityColors[badge.rarity])}>
                                {badge.rarity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{badge.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Badges Yet</h3>
                <p className="text-gray-600 mb-4">Complete workouts and challenges to earn your first badges!</p>
                <Button onClick={() => navigate("/home")} className="bg-purple-600 hover:bg-purple-700">
                  Start Working Out
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Navigation />
    </>
  );
}