import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  User,
  Edit,
  Check,
  Coins,
  History,
  Dumbbell
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import type { FrontendBadge } from "../types";
import { useUserStore } from "@/stores/useUserStore";
import { userService } from "@/services/userService";
import { badgeService } from "@/services/badgeService";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedHeight, setEditedHeight] = useState<number>();
  const [editedWeight, setEditedWeight] = useState<number>();
  const [editedAge, setEditedAge] = useState<number>();
  const [ownedAvatars] = useState<string[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<FrontendBadge | null>(
    null
  );
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [allBadges, setAllBadges] = useState<FrontendBadge[]>([]);
  const [userBadges, setUserBadges] = useState<FrontendBadge[]>([]);
  
  const user = useUserStore();

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const [all, userOwned] = await Promise.all([
          badgeService.getAllBadges(),
          badgeService.getUserBadges()
        ]);
        setAllBadges(all); // All badges from the backend
        
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
    }
  }, []);

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
      user.setUser(updatedUserData);
      setEditMode(false);
    }
  };

  const changeAvatar = async (newAvatar: string) => {
    if (user) {
      const updatedUserData = {
        avatar: newAvatar
      };
      //TODO SAVE USER AVATAR HERE
      user.setUser(updatedUserData);
    }
  };

  const handleRegenerateWorkout = () => {
    // Redirect to onboarding survey
    navigate("/onboarding");
  };

  const handleBadgeClick = (badge: FrontendBadge | undefined) => {
    const badgeWithDesc = allBadges.find((b) => b.id === badge?.id) || {
      id: typeof badge?.id === "number" ? badge.id : 0,
      name: badge?.name || "Unknown Badge",
      icon: badge?.icon || "❓",
      description: "Achievement unlocked for your fitness journey!",
      earnedOn: "Recently"
    };
  
    setSelectedBadge(badgeWithDesc);
    setBadgeDialogOpen(true);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-purple-100 p-4 pb-20">
      <header className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-800">Profile</h1>
      </header>

      <Card className="mb-6">
        <CardContent className="flex items-center space-x-4 pt-6">
          <img
            src={user.avatar || "/placeholder.svg"}
            alt="User Avatar"
            width={80}
            height={80}
            className="rounded-full"
          />
          <div>
            {editMode ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="mb-2"
              />
            ) : (
              <h2 className="text-xl font-bold">{user.name}</h2>
            )}
            {editMode ? (
              <Input
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="mb-2"
              />
            ) : (
              <p className="text-gray-600">{user.email}</p>
            )}
            <p className="text-purple-600 font-semibold mt-2 flex items-center">
              <Coins className="w-4 h-4 mr-1 text-yellow-500" />
              {user.coins} coins
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </div>
            {editMode ? (
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Check className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={() => setEditMode(true)}
                className="h-8 w-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Age</p>
              {editMode ? (
                <Input
                  type="number"
                  value={editedAge}
                  onChange={(e) => setEditedAge(parseInt(e.target.value))}
                />
              ) : (
                <p className="font-medium">{user.age} years</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Weight</p>
              {editMode ? (
                <Input
                  type="number"
                  value={editedWeight}
                  onChange={(e) => setEditedWeight(parseInt(e.target.value))}
                />
              ) : (
                <p className="font-medium">{user.weight} kg</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Height</p>
            {editMode ? (
              <Input
                type="number"
                value={editedHeight}
                onChange={(e) => setEditedHeight(parseInt(e.target.value))}
              />
            ) : (
              <p className="font-medium">{user.height} cm</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Your Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center">
          {userBadges.map((badge) => (
              <motion.div
                key={badge.id}
                className="flex flex-col items-center w-24 m-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBadgeClick(badge)}
              >
                <div className="text-4xl mb-1 bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                  {badge.icon}
                </div>
                <div className="text-sm font-medium text-center text-purple-800 mt-1 w-full truncate">
                  {badge.name}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Your Avatars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4">
            {ownedAvatars.map((avatarId) => {
              // TODO: Replace with actual avatar fetching logic
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const avatars: any[] = [];

              const avatar = avatars.find(
                (a: { id: number }) => String(a.id) === avatarId
              );
              if (!avatar) return null;
              return (
                <Button
                  key={avatarId}
                  variant="outline"
                  className={`p-0 h-14 w-14 rounded-full overflow-hidden ${
                    user?.avatar === avatar.image
                      ? "ring-2 ring-purple-600"
                      : ""
                  }`}
                  onClick={() => changeAvatar(avatar.image)}
                >
                  <img
                    src={avatar.image || "/placeholder.svg"}
                    alt={avatar.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                </Button>
              );
            })}
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
                <p className="text-purple-100 text-sm">Refresh your routine</p>
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

      {/* Badge Detail Dialog */}
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
  );
}
