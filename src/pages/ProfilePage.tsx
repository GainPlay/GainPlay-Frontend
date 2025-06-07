import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  User,
  Edit,
  Check,
  Coins,
  History,
  Dumbbell,
  TrendingUp,
  Lightbulb,
  Loader2 // Import Loader2 icon for loading state
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import type { FrontendBadge, HealthInsight } from "../types";
import { useUserStore } from "@/stores/useUserStore";
import { userService } from "@/services/userService";
import { badgeService } from "@/services/badgeService";
import { useAvatarStore } from "@/stores/useAvatarStore";
import { avatarService } from "@/services/avatarService";
import Navigation from "@/components/Navigation";

// Component for the Skeleton Loader
const HealthInsightSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="p-3 rounded-xl shadow-md bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"
      >
        <div className="flex items-start space-x-3">
          <div className="bg-gray-400 rounded-full p-2 flex-shrink-0 w-8 h-8"></div>
          <div className="flex-1 min-w-0">
            <div className="h-10 bg-gray-400 rounded w-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const getHealthInsights = async (userId: number) => {
  const insights = await userService.getUserInsights(userId);
  return insights;
};

const generateHealthInsights = (userId: number) => {
  return getHealthInsights(userId);
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedHeight, setEditedHeight] = useState<number>();
  const [editedWeight, setEditedWeight] = useState<number>();
  const [editedAge, setEditedAge] = useState<number>();
  const [selectedBadge, setSelectedBadge] = useState<FrontendBadge | null>(
    null
  );
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [allBadges, setAllBadges] = useState<FrontendBadge[]>([]);
  const [userBadges, setUserBadges] = useState<FrontendBadge[]>([]);
  const [ownedAvatars] = useState<string[]>([]);
  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true); // New state for loading insights
  const [regeneratingInsights, setRegeneratingInsights] = useState(false); // New state for regenerate button loading

  const user = useUserStore();
  const { initializeAvatars } = useAvatarStore();

  useEffect(() => {
    initializeAvatars();
  }, []);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const [all, userOwned] = await Promise.all([
          badgeService.getAllBadges(),
          badgeService.getUserBadges()
        ]);
        setAllBadges(all);
        setUserBadges(userOwned);
      } catch (err) {
        console.error("Failed to load badges:", err);
      }
    };

    if (user) {
      setEditedName(user.name!);
      setEditedEmail(user.email);
      setEditedHeight(user.height);
      setEditedWeight(user.weight);
      setEditedAge(user.age);
      loadBadges();

      // Initial load of health insights
      setLoadingInsights(true); // Start loading
      generateHealthInsights(user.id)
        .then((insights) => {
          setHealthInsights(insights.insights);
        })
        .finally(() => {
          setLoadingInsights(false); // End loading
        });
    }
  }, [user]);

  const handleRegenerateInsights = async () => {
    if (user) {
      setRegeneratingInsights(true); // Start regenerating state
      setHealthInsights([]); // Clear current insights to show skeleton
      try {
        const insights = await generateHealthInsights(user.id);
        setHealthInsights(insights.insights);
      } catch (error) {
        console.error("Failed to regenerate insights:", error);
      } finally {
        setRegeneratingInsights(false); // End regenerating state
      }
    }
  };

  const handleSave = async () => {
    if (user) {
      const updatedUserData = {
        name: editedName,
        email: editedEmail,
        height: editedHeight,
        weight: editedWeight,
        age: editedAge
      };
      await userService.updateUser(user.id, updatedUserData);
      console.log("User data updated:", updatedUserData);
      user.setUser(updatedUserData);
      setEditMode(false);
    }
  };

  const changeAvatar = async (newAvatar: number) => {
    if (user) {
      const newAvatarData = await avatarService.setCurrentAvatar(newAvatar);
      if (newAvatarData.success)
        user.setUser({ avatar_url: newAvatarData.avatarUrl });
    }
  };

  const handleRegenerateWorkout = () => {
    navigate("/onboarding");
  };

  const handleBadgeClick = (badge: FrontendBadge) => {
    const badgeWithDesc = allBadges.find((b) => b.id === badge.id) || {
      ...badge,
      description: "Achievement unlocked for your fitness journey!",
      earnedOn: "Recently"
    };

    setSelectedBadge(badgeWithDesc);
    setBadgeDialogOpen(true);
  };

  const handleProgressNavigation = () => {
    navigate("/progress");
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <>
      <div className="flex flex-col min-h-screen bg-purple-100 p-4 pb-20">
        <Card className="mb-6 overflow-hidden border-none shadow-lg">
          <CardContent className="p-0">
            <div className="bg-gradient-to-b from-indigo-500/90 to-purple-600/90 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full border-4 border-white/30 overflow-hidden shadow-lg">
                    <img
                      src={user.avatar_url || "/placeholder.svg"}
                      alt="User Avatar"
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center border-2 border-white shadow-md">
                    {user.level || 1}
                  </div>
                </div>

                <div className="text-white">
                  <h2 className="text-xl font-bold mb-1">{user.name}</h2>

                  <p className="text-indigo-100 text-sm mb-1">{user.email}</p>

                  <div className="flex items-center bg-yellow-500/20 rounded-full px-3 py-1 w-fit">
                    <Coins className="w-4 h-4 mr-1 text-yellow-300" />
                    <span className="font-bold text-yellow-100">
                      {user.coins} coins
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                {editMode ? (
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 p-2"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setEditMode(true)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 p-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-b from-white to-purple-50">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="bg-white/20 rounded-full p-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-blue-100 text-xs font-medium">AGE</p>
                  </div>
                  <div className="text-center">
                    {editMode ? (
                      <Input
                        type="number"
                        value={editedAge}
                        onChange={(e) => setEditedAge(parseInt(e.target.value))}
                        className="bg-white/20 border-white/30 text-white placeholder-white/70 text-center text-lg font-bold h-8 p-1"
                        placeholder="Age"
                      />
                    ) : (
                      <p className="text-xl font-bold">{user.age}</p>
                    )}
                    <p className="text-blue-100 text-xs">years</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="bg-white/20 rounded-full p-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-green-100 text-xs font-medium">WEIGHT</p>
                  </div>
                  <div className="text-center">
                    {editMode ? (
                      <Input
                        type="number"
                        value={editedWeight}
                        onChange={(e) =>
                          setEditedWeight(parseInt(e.target.value))
                        }
                        className="bg-white/20 border-white/30 text-white placeholder-white/70 text-center text-lg font-bold h-8 p-1"
                        placeholder="Weight"
                      />
                    ) : (
                      <p className="text-xl font-bold">{user.weight}</p>
                    )}
                    <p className="text-green-100 text-xs">kg</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="bg-white/20 rounded-full p-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-orange-100 text-xs font-medium">
                      HEIGHT
                    </p>
                  </div>
                  <div className="text-center">
                    {editMode ? (
                      <Input
                        type="number"
                        value={editedHeight}
                        onChange={(e) =>
                          setEditedHeight(parseInt(e.target.value))
                        }
                        className="bg-white/20 border-white/30 text-white placeholder-white/70 text-center text-lg font-bold h-8 p-1"
                        placeholder="Height"
                      />
                    ) : (
                      <p className="text-xl font-bold">{user.height}</p>
                    )}
                    <p className="text-orange-100 text-xs">cm</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {user.height &&
                  user.weight &&
                  user.height > 0 &&
                  user.weight > 0 && (
                    <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-purple-500 rounded-full p-1.5 mr-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-purple-800 text-sm">
                              BMI
                            </h4>
                            <p className="text-xs text-purple-600">
                              Body Mass Index
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-800">
                            {(
                              user.weight / Math.pow(user.height / 100, 2)
                            ).toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-yellow-500 rounded-full p-1.5 mr-2">
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-800 text-sm">
                          Fitness Level
                        </h4>
                        <p className="text-xs text-yellow-600">
                          Current progress
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Level {user.level || 1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 overflow-hidden border-none shadow-lg">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-4">
            <CardTitle className="flex items-center text-white">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">Your Badges</span>
            </CardTitle>
            <p className="text-yellow-100 text-sm mt-1">
              Achievements you've unlocked
            </p>
          </div>
          <CardContent className="p-4 bg-gradient-to-b from-white to-yellow-50">
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
              <div
                className="flex space-x-4"
                style={{ minWidth: "max-content" }}
              >
                {userBadges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    className="flex flex-col items-center w-20 cursor-pointer"
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBadgeClick(badge)}
                  >
                    <div className="text-4xl mb-1 bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 border border-yellow-100">
                      {badge.icon}
                    </div>
                    <div className="text-sm font-medium text-center text-amber-800 mt-2 w-full truncate">
                      {badge.name}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 overflow-hidden border-none shadow-lg">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
            <CardTitle className="flex items-center text-white">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">Your Avatars</span>
            </CardTitle>
            <p className="text-purple-100 text-sm mt-1">
              Select your profile picture
            </p>
          </div>
          <CardContent className="p-4 bg-gradient-to-b from-white to-purple-50">
            <div className="flex flex-wrap justify-center gap-4">
              {ownedAvatars.map((avatarId) => {
                // TODO: Replace with actual avatar fetching logic
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const avatars: any[] = [];

                const avatar = avatars.find(
                  (a: { id: number }) => String(a.id) === avatarId
                );
                if (!avatar) return null;
                const isSelected = user?.avatar_url === avatar.image_url;
                return (
                  <motion.div
                    key={avatarId}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Button
                      variant="outline"
                      className={`p-0 h-16 w-16 rounded-full overflow-hidden transition-all duration-200 ${
                        isSelected
                          ? "ring-4 ring-purple-500 border-white shadow-lg"
                          : "border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-md"
                      }`}
                      onClick={() => changeAvatar(avatar.id)}
                    >
                      <img
                        src={avatar.image_url || "/placeholder.svg"}
                        alt={avatar.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </Button>
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-sm border border-white">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => navigate("/cart")}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Coins className="w-4 h-4 mr-2 text-yellow-500" />
                Get More Avatars
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-green-500 to-green-600 text-white">
            <Button
              onClick={() => navigate("/workout-history")}
              className="h-auto py-4 px-4 bg-transparent hover:bg-green-700/20 rounded-none flex items-center justify-between w-full"
            >
              <div className="flex items-center">
                <div className="bg-white rounded-full p-2 mr-4">
                  <History className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Workout History</h3>
                  <p className="text-green-100 text-sm">Track your progress</p>
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-1">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Button>
          </Card>

          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <Button
              onClick={handleRegenerateWorkout}
              className="h-auto py-4 px-4 bg-transparent hover:bg-purple-700/20 rounded-none flex items-center justify-between w-full"
            >
              <div className="flex items-center">
                <div className="bg-white rounded-full p-2 mr-4">
                  <Dumbbell className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">New Workout Plan</h3>
                  <p className="text-purple-100 text-sm">
                    Refresh your routine
                  </p>
                </div>
              </div>
              <div className="bg-white/20 rounded-full p-1">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Button>
          </Card>
        </div>

        <Card className="mb-6 overflow-hidden border-none shadow-md bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <Button
            onClick={handleProgressNavigation}
            className="h-auto py-4 px-4 bg-transparent hover:bg-orange-700/20 rounded-none flex items-center justify-between w-full"
          >
            <div className="flex items-center">
              <div className="bg-white rounded-full p-2 mr-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Progress & Badges</h3>
                <p className="text-orange-100 text-sm">
                  View your achievements
                </p>
              </div>
            </div>
            <div className="bg-white/20 rounded-full p-1">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Button>
        </Card>

        <Card className="mb-6 overflow-hidden border-none shadow-lg">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-2 mr-3">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Health Insights</span>
              </div>
              <Button
                size="sm"
                onClick={handleRegenerateInsights}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 p-2"
                disabled={regeneratingInsights} // Disable button during regeneration
              >
                {regeneratingInsights ? (
                  <Loader2 className="w-4 h-4 animate-spin" /> // Show spinner
                ) : (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 12C2 16.97 6.03 21 11 21C13.39 21 15.68 20.06 17.4 18.4L15.9 16.9C14.5 18.3 12.8 19 11 19C7.13 19 4 15.87 4 12C4 8.13 7.13 5 11 5C13.55 5 15.84 6.26 17.2 8.2L15 10.5H21V4.5L18.8 6.7C16.97 4.26 14.07 3 11 3C6.03 3 2 7.03 2 12Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </Button>
            </CardTitle>
            <p className="text-emerald-100 text-sm mt-1">
              Personalized recommendations for you
            </p>
          </div>

          <CardContent className="p-4 bg-gradient-to-b from-white to-emerald-50">
            {loadingInsights || regeneratingInsights ? (
              <HealthInsightSkeleton /> // Show skeleton when loading or regenerating
            ) : healthInsights.length > 0 ? (
              <div className="space-y-3">
                {healthInsights.map((insight, index) => (
                  <motion.div
                    key={insight.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-xl text-white shadow-md bg-gradient-to-r from-${insight.color}-500 to-${insight.color}-600`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                        <span className="text-lg">{insight.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-xs opacity-90 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No health insights available.
              </p>
            )}
          </CardContent>
        </Card>

        <Dialog open={badgeDialogOpen} onOpenChange={setBadgeDialogOpen}>
          <DialogContent className="sm:max-w-md max-w-[85%] mx-auto">
            <DialogHeader>
              <DialogTitle className="text-center">
                {selectedBadge?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center p-4">
              <div className="text-6xl mb-6 bg-purple-50 w-24 h-24 rounded-full flex items-center justify-center shadow-md">
                {selectedBadge?.icon}
              </div>
              <p className="text-center text-gray-700 mb-4">
                {selectedBadge?.description}
              </p>
            </div>
            <div className="flex justify-center mt-2">
              <Button
                onClick={() => setBadgeDialogOpen(false)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Navigation />
    </>
  );
}
