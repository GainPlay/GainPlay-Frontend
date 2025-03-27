import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { friends as initialFriends, allGoals } from "../data/mockData";
import type { Friend, UserData } from "../types";
import { toast } from "../components/ui/use-toast";

interface FriendsPageProps {
  userData: UserData;
  updateUserData: (newData: Partial<UserData>) => void;
}

export default function FriendsPage({
  userData,
  updateUserData
}: FriendsPageProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [filteredFriends, setFilteredFriends] =
    useState<Friend[]>(initialFriends);

  useEffect(() => {
    const updatedFriends = initialFriends.map((friend) => ({
      ...friend,
      isFriend: userData.friends.some((f: Friend) => f.id === friend.id)
    }));
    setFilteredFriends(updatedFriends);
  }, [userData]);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedGoals, userData]);

  const handleSearch = () => {
    const filtered = initialFriends
      .map((friend) => ({
        ...friend,
        isFriend: userData
          ? userData.friends.some((f) => f.id === friend.id)
          : friend.isFriend
      }))
      .filter((friend) => {
        const nameMatch = friend.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const emailMatch = friend.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const goalsMatch =
          selectedGoals.length === 0 ||
          selectedGoals.some((goal) => friend.goals.includes(goal));
        return (nameMatch || emailMatch) && goalsMatch;
      });
    setFilteredFriends(filtered);
  };

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
        variant: "default"
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
      variant: "default"
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
          {allGoals.map((goal) => (
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
