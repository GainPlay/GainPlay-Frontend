import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { ArrowLeft, Trophy, Target, UserCheck } from "lucide-react";
import type { Friend, Badge, UserData } from "../types";
import { friends, badges } from "../data/mockData";
import { toast } from "../hooks/use-toast";

interface UserProfilePageProps {
  userData: UserData;
  updateUserData: (newData: Partial<UserData>) => void;
}

export default function UserProfilePage({
  userData,
  updateUserData
}: UserProfilePageProps) {
  const navigate = useNavigate();
  const params = useParams();
  const [user, setUser] = useState<Friend | null>(null);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const userId = Number.parseInt(params.id || "0");
    const foundUser = friends.find((friend) => friend.id === userId);
    if (foundUser) {
      const isFriendStatus = userData.friends.some(
        (f: Friend) => f.id === foundUser.id
      );
      setUser({ ...foundUser, isFriend: isFriendStatus });
      setIsFriend(isFriendStatus);
    }
  }, [params.id, userData]);

  const handleAddFriend = () => {
    if (user) {
      const updatedUser = { ...user, isFriend: true };
      setUser(updatedUser);
      setIsFriend(true);

      updateUserData({ friends: [...userData.friends, updatedUser] });

      toast({
        title: "Friend Added",
        description: `You are now friends with ${user.name}.`,
        variant: "default"
      });
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-purple-100 p-4 pb-20">
      <header className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800">
          {user.name}'s Profile
        </h1>
      </header>

      <Card className="mb-6">
        <CardContent className="flex items-center space-x-4 pt-6">
          <img
            src={user.avatar || "/placeholder.svg"}
            alt={`${user.name}'s Avatar`}
            width={80}
            height={80}
            className="rounded-full"
          />
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-purple-600 font-semibold mt-2 flex items-center">
              <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
              Level {user.level}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            {user.name}'s Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.goals.map((goal, index) => {
            const goalValue = user.goalValues
              ? user.goalValues[index]
              : Math.floor(Math.random() * 10) + 1;
            return (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>{goal}</span>
                  <span>{goalValue}/10</span>
                </div>
                <Progress value={goalValue * 10} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            {user.name}'s Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {badges.slice(0, 3).map((badge: Badge) => (
              <div key={badge.id} className="flex flex-col items-center">
                <div className="text-4xl mb-1">{badge.icon}</div>
                <div className="text-sm text-center">{badge.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!isFriend && (
        <Button
          onClick={handleAddFriend}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 mb-4"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Add Friend
        </Button>
      )}
    </div>
  );
}
