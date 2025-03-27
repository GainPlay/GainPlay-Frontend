import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import {
  ArrowLeft,
  Trophy,
  Target,
  User,
  Edit,
  Check,
  Coins,
  UserCheck
} from "lucide-react";
import { Slider } from "../components/ui/slider";
import type { UserData } from "../types";
import { avatars } from "../data/mockData";

interface ProfilePageProps {
  userData: UserData;
  updateUserData: (newData: Partial<UserData>) => void;
}

export default function ProfilePage({
  userData,
  updateUserData
}: ProfilePageProps) {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(userData.name);
  const [editedEmail, setEditedEmail] = useState(userData.email);
  const [editedGoals, setEditedGoals] = useState<{ [key: string]: number }>(
    userData.goals
  );
  const [ownedAvatars, setOwnedAvatars] = useState<string[]>([]);

  const handleSave = () => {
    const updatedUserData = {
      name: editedName,
      email: editedEmail,
      goals: editedGoals
    };
    updateUserData(updatedUserData);
    setEditMode(false);
  };

  const changeAvatar = (newAvatar: string) => {
    updateUserData({ avatar: newAvatar });
    localStorage.setItem("currentAvatar", newAvatar);
  };

  return (
    <div className="flex flex-col min-h-screen bg-purple-100 p-4 pb-20">
      <header className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="mr-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800">Profile</h1>
      </header>

      <Card className="mb-6">
        <CardContent className="flex items-center space-x-4 pt-6">
          <img
            src={userData.avatar || "/placeholder.svg"}
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
              <h2 className="text-xl font-bold">{userData.name}</h2>
            )}
            {editMode ? (
              <Input
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="mb-2"
              />
            ) : (
              <p className="text-gray-600">{userData.email}</p>
            )}
            <p className="text-purple-600 font-semibold mt-2 flex items-center">
              <Coins className="w-4 h-4 mr-1 text-yellow-500" />
              {userData.coins} coins
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Your Goals
            </div>
            {editMode ? (
              <Button size="sm" onClick={handleSave}>
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
            ) : (
              <Button size="sm" onClick={() => setEditMode(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(userData.goals || {}).map(([goal, value]) => (
            <div key={goal} className="mb-4">
              <div className="flex justify-between mb-1">
                <span>{goal}</span>
                <span>{editMode ? editedGoals[goal] : value}/10</span>
              </div>
              {editMode ? (
                <Slider
                  value={[editedGoals[goal] || 0]}
                  onValueChange={(newValue) =>
                    setEditedGoals({ ...editedGoals, [goal]: newValue[0] })
                  }
                  max={10}
                  step={1}
                />
              ) : (
                <Progress value={value * 10} className="h-2" />
              )}
            </div>
          ))}
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
          <div className="flex flex-wrap gap-4">
            {userData.badges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center">
                <div className="text-4xl mb-1">{badge.icon}</div>
                <div className="text-sm text-center">{badge.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Your Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`grid grid-cols-2 gap-4 ${
              userData.friends.length > 6 ? "h-60 overflow-y-auto pr-2" : ""
            }`}
          >
            {userData.friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => navigate(`/user/${friend.id}`)}
              >
                <img
                  src={friend.avatar || "/placeholder.svg"}
                  alt={`${friend.name}'s avatar`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold text-sm">{friend.name}</p>
                  <p className="text-xs text-gray-600">Level {friend.level}</p>
                </div>
              </div>
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
          <div className="flex flex-wrap gap-4">
            {ownedAvatars.map((avatarId) => {
              const avatar = avatars.find((a) => a.id === avatarId);
              if (!avatar) return null;
              return (
                <Button
                  key={avatarId}
                  variant="outline"
                  className={`p-1 rounded-full ${
                    userData?.avatar === avatar.image
                      ? "ring-2 ring-purple-600"
                      : ""
                  }`}
                  onClick={() => changeAvatar(avatar.image)}
                >
                  <div className="rounded-full overflow-hidden">
                    <img
                      src={avatar.image || "/placeholder.svg"}
                      alt={avatar.name}
                      width={50}
                      height={50}
                    />
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
