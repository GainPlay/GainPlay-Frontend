import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, UserPlus, UserX, Check, X } from "lucide-react";
import { badges, friends } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { FriendshipStatus, FrontendUserData, UserGoal } from "@/types";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const params = useParams();
  const { state } = useLocation();
  const userId = Number(params.id);

  const [user, setUser] = useState<FrontendUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // // Load all friends data from localStorage
    // const storedFriends = localStorage.getItem("friendsData");
    // let friendsData: FriendWithStatus[] = [];
    // if (storedFriends) {
    //   friendsData = JSON.parse(storedFriends);
    //   setAllFriends(friendsData);
    //   // Find the specific user
    //   const foundUser = friendsData.find((friend) => friend.id === userId);
    //   if (foundUser) {
    //     setUser(foundUser);
    //     setIsLoading(false);
    //   } else {
    //     // If user not found in localStorage, try to find in mock data
    //     const mockUser = friends.find((friend) => friend.id === userId);
    //     if (mockUser) {
    //       const userWithStatus = {
    //         ...mockUser,
    //         status: "none" as const,
    //       };
    //       setUser(userWithStatus);
    //       // Add this user to our friends data
    //       const updatedFriends = [...friendsData, userWithStatus];
    //       setAllFriends(updatedFriends);
    //       localStorage.setItem("friendsData", JSON.stringify(updatedFriends));
    //       setIsLoading(false);
    //     } else {
    //       // Handle user not found
    //       toast({
    //         title: "User not found",
    //         description: "The requested user profile could not be found.",
    //         variant: "destructive",
    //       });
    //       navigate("/friends");
    //     }
    //   }
    // } else {
    //   // If no stored friends data, initialize with mock data
    //   const mockUser = friends.find((friend) => friend.id === userId);
    //   if (mockUser) {
    //     const friendsWithStatus = friends.map((friend) => ({
    //       ...friend,
    //       status: "none" as const,
    //     }));
    //     // Set the found user
    //     const userWithStatus = friendsWithStatus.find((friend) => friend.id === userId);
    //     setUser(userWithStatus || null);
    //     // Store all friends
    //     setAllFriends(friendsWithStatus);
    //     localStorage.setItem("friendsData", JSON.stringify(friendsWithStatus));
    //     setIsLoading(false);
    //   } else {
    //     // Handle user not found
    //     toast({
    //       title: "User not found",
    //       description: "The requested user profile could not be found.",
    //       variant: "destructive",
    //     });
    //     navigate("/friends");
    //   }
    // }
  }, [userId, navigate]);

  const handleFriendAction = (action: "add" | "accept" | "reject" | "remove") => {
    switch (action) {
      case "add":
        break;
      case "accept":
        break;
      case "reject":
        break;
      case "remove":
        break;
    }
  };

  if (isLoading || !user) {
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

  return (
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
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-purple-200 text-purple-700 text-2xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-white text-purple-600 text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center border-2 border-purple-600">
                {user.level}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
            <p className="text-purple-200">{user.email}</p>
          </div>

          <CardContent className="p-6">
            <div className="flex justify-center space-x-2 mb-6">
              {user.status === FriendshipStatus.NOT_FRIENDS && (
                <Button onClick={() => handleFriendAction("add")} className="bg-purple-600 hover:bg-purple-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Friend
                </Button>
              )}

              {user.status === FriendshipStatus.PENDING && (
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
              )}

              {user.status === FriendshipStatus.ACCEPTED && (
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
                  {user.user_goals.map((goal: UserGoal, index: number) => (
                    <Badge key={index} className="bg-purple-100 text-purple-700 px-3 py-1.5">
                      {goal.goals.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-800 mb-3">Achievements</h3>
                <div className="grid grid-cols-3 gap-4">
                  {badges.slice(0, 3).map((badge) => (
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
                    <div className="text-2xl font-bold text-purple-700">{user.level}</div>
                    <div className="text-xs text-purple-600">Level</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
