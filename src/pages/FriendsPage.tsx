import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "../hooks/use-toast";
import type { Friend, UserData } from "../types";

interface FriendsPageProps {
  userData: UserData;
  updateUserData: (newData: Partial<UserData>) => void;
}

export default function FriendsPage({
  userData,
  updateUserData,
}: FriendsPageProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  const getAllGoals = (): Promise<string[]> => {
    return axios
      .get("/api/goals")
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error fetching goals data:", error);
        throw error;
      });
  };

  const getFriendsData = (): Promise<Friend[] | null> => {
    return axios
      .get<Friend[]>("/api/friends")
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error fetching friends data:", error);
        return null;
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      const initialFriends = await getFriendsData();
      if (initialFriends) {
        const updatedFriends = initialFriends.map((friend: Friend) => ({
          ...friend,
          isFriend: userData.friends.some((f: Friend) => f.id === friend.id),
        }));
        setFilteredFriends(updatedFriends);
      } else {
        setFilteredFriends([]);
      }
    };

    fetchData();
  }, [userData]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const goalsData = await getAllGoals();
        setGoals(goalsData);
      } catch (error) {
        console.log("Failed to fetch goals");
      }
    };

    fetchGoals();
  }, []);

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleAddFriend = (friend: Friend) => {
    if (friend.isFriend) {
      toast({
        title: "Already Friends",
        description: `You're already friends with ${friend.name}.`,
        variant: "default",
      });
      return;
    }

    const updatedFriends = filteredFriends.map((f) =>
      f.id === friend.id ? { ...f, isFriend: true } : f
    );
    setFilteredFriends(updatedFriends);

    const newFriend = { ...friend, isFriend: true };
    updateUserData({ friends: [...userData.friends, newFriend] });

    toast({
      title: "Friend Added",
      description: `You are now friends with ${friend.name}.`,
      variant: "default",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-purple-100 p-4 pb-20">
      <h1 className="text-2xl font-bold text-purple-800 mb-6">Find Friends</h1>
      <div className="flex flex-col mb-4 space-y-4">
        <Input
          placeholder="Search friends by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <div className="flex flex-wrap gap-2">
          {goals.map((goal) => (
            <div key={goal} className="flex items-center">
              <Checkbox
                id={goal}
                checked={selectedGoals.includes(goal)}
                onCheckedChange={() => handleGoalToggle(goal)}
              />
              <Label htmlFor={goal} className="ml-2 text-sm">
                {goal}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4 overflow-y-auto pb-20">
        {filteredFriends.map((friend) => (
          <Card key={friend.id}>
            <CardContent className="flex items-center space-x-4 p-4">
              <img
                src={friend.avatar || "/placeholder.svg"}
                alt={`${friend.name}'s avatar`}
                width={50}
                height={50}
                className="rounded-full cursor-pointer"
                onClick={() => navigate(`/user/${friend.id}`)}
              />
              <div
                className="flex-grow cursor-pointer"
                onClick={() => navigate(`/user/${friend.id}`)}
              >
                <h2 className="text-base font-semibold">{friend.name}</h2>
                <p className="text-xs text-gray-600">{friend.email}</p>
                <div className="flex flex-wrap mt-1">
                  {friend.goals.map((goal, index) => (
                    <span
                      key={index}
                      className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-xs font-semibold">Level {friend.level}</p>
                <Button
                  variant={friend.isFriend ? "secondary" : "outline"}
                  className="mt-2 text-xs px-2 py-1"
                  onClick={() => handleAddFriend(friend)}
                  disabled={friend.isFriend}
                >
                  {friend.isFriend ? "Friends" : "Add Friend"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
