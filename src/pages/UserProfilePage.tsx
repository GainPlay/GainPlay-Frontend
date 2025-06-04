import Navigation from "@/components/Navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { friendsService } from "@/services/friendsService";
import { userService } from "@/services/userService";
import { useBadgeStore } from "@/stores/useBadgeStore";
import { useUserStore } from "@/stores/useUserStore";
import { Friendship, FriendshipStatus, FrontendUserData, UserGoal } from "@/types";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Trophy, UserPlus, UserX, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const params = useParams();
  const userId = Number(params.id);

  const [userProfile, setUserProfile] = useState<FrontendUserData | null>(null);
  const [friendship, setFriendship] = useState<Friendship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUserStore();

  useEffect(() => {
    const getUserData = async (): Promise<void> => {
      const fetchedUser = await userService.getUserData(userId);
      if (!fetchedUser) {
        toast({
          title: "User not found",
          description: "The requested user profile could not be found.",
          variant: "destructive",
        });
        navigate("/friends");
        return;
      }
      setUserProfile(fetchedUser);

      const fetchedFriendship = await friendsService.getFriendship(userId);
      setFriendship(fetchedFriendship);
      setIsLoading(false);
    };
    getUserData();
  }, [userId, navigate]);

  const { allBadges, initializeBadges } = useBadgeStore();

  useEffect(() => {
    initializeBadges();
  }, []);

  const handleFriendAction = async (action: "add" | "accept" | "reject" | "remove"): Promise<void> => {
    try {
      let updated: Friendship | null = null;

      switch (action) {
        case "add":
          updated = await friendsService.sendFriendRequest({
            user_id: user.id,
            friend_id: userProfile?.id,
            status: FriendshipStatus.PENDING,
          });
          toast({
            title: "Friend Request Sent",
            description: `You sent a friend request to ${userProfile?.name}`,
            variant: "default",
          });
          break;
        case "accept":
          if (friendship) {
            updated = await friendsService.updateFriendship(friendship.id, {
              status: FriendshipStatus.ACCEPTED,
            });
          }
          toast({
            title: "Friend Request Accepted",
            description: `You are now friends with ${userProfile?.name}`,
            variant: "default",
          });
          break;
        case "reject":
        case "remove":
          if (friendship) {
            await friendsService.deleteFriendship(friendship.id);
          }
          toast({
            title: "Friend Removed",
            description: `You removed ${userProfile?.name} from your friends`,
            variant: "destructive",
          });
          break;
      }

      setFriendship(updated);
    } catch (error) {
      console.error("Friend action error:", error);
    }
  };

  if (isLoading || !userProfile) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-4 pb-20">
        <header className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate("/friends")} className="mr-2 p-2">
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </Button>
          <h1 className="text-2xl font-bold text-purple-800">User Profile</h1>
        </header>

        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  console.log(friendship);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-4 pb-20">
        <header className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate("/friends")} className="mr-2 p-2">
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </Button>
          <h1 className="text-2xl font-bold text-purple-800">User Profile</h1>
        </header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-4 border-white">
                  <AvatarImage src={userProfile.avatar_url || "/placeholder.svg"} alt={userProfile.name} />
                  <AvatarFallback className="bg-purple-200 text-purple-700 text-2xl">
                    {userProfile.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-white text-purple-600 text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center border-2 border-purple-600">
                  {userProfile.level}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{userProfile.name}</h2>
              <p className="text-purple-200">{userProfile.email}</p>
            </div>

            <CardContent className="p-6">
              <div className="flex justify-center space-x-2 mb-6">
                {!friendship && (
                  <Button onClick={() => handleFriendAction("add")} className="bg-purple-600 hover:bg-purple-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                )}

                {friendship?.status === FriendshipStatus.PENDING &&
                  (friendship.user_id === user.id ? (
                    <Button variant="outline" className="border-purple-200 text-purple-700" disabled>
                      <Check className="w-4 h-4 mr-2" />
                      Request Sent
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleFriendAction("reject")}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button onClick={() => handleFriendAction("accept")} className="bg-green-600 hover:bg-green-700">
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  ))}

                {friendship?.status === FriendshipStatus.ACCEPTED && (
                  <Button
                    onClick={() => handleFriendAction("remove")}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Remove Friend
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                    Fitness Goals
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.user_goals?.map((goal: UserGoal, index: number) => (
                      <Badge key={index} className="bg-purple-100 text-purple-700 px-3 py-1.5">
                        {goal.goals.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Achievements</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {allBadges?.slice(0, 3).map((badge) => (
                      <div key={badge.id} className="flex flex-col items-center text-center">
                        <div className="text-4xl mb-1">{badge.icon}</div>
                        <div className="text-sm">{badge.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Stats</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">{Math.floor(Math.random() * 30) + 1}</div>
                      <div className="text-xs text-purple-600">Workouts</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">{Math.floor(Math.random() * 20) + 1}</div>
                      <div className="text-xs text-purple-600">Day Streak</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">{userProfile.level}</div>
                      <div className="text-xs text-purple-600">Level</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Navigation />
    </>
  );
}
