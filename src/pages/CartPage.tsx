import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft, Coins } from "lucide-react";
import { toast } from "../hooks/use-toast";
import type { UserData } from "../types";

type Avatar = {
  id: string;
  name: string;
  image: string;
  price: number;
};

const avatars: Avatar[] = [
  {
    id: "1",
    name: "Sporty Spice",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Sporty",
    price: 100,
  },
  {
    id: "2",
    name: "Zen Master",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Zen",
    price: 150,
  },
  {
    id: "3",
    name: "Power Lifter",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Power",
    price: 200,
  },
  {
    id: "4",
    name: "Yoga Guru",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Yoga",
    price: 250,
  },
  {
    id: "5",
    name: "Runner",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Runner",
    price: 300,
  },
  {
    id: "6",
    name: "Swimmer",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Swimmer",
    price: 350,
  },
  {
    id: "7",
    name: "Cyclist",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Cyclist",
    price: 400,
  },
  {
    id: "8",
    name: "Boxer",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Boxer",
    price: 450,
  },
];

interface CartPageProps {
  userData: UserData;
  updateUserData: (newData: Partial<UserData>) => void;
}

// eslint-disable-next-line no-empty-pattern
export default function CartPage({}: CartPageProps) {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);
  const [ownedAvatars, setOwnedAvatars] = useState<string[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState("");

  useEffect(() => {
    const storedCoins = localStorage.getItem("userCoins");
    const storedOwnedAvatars = localStorage.getItem("ownedAvatars");
    const storedCurrentAvatar = localStorage.getItem("currentAvatar");

    if (storedCoins) setCoins(Number.parseInt(storedCoins));
    if (storedOwnedAvatars) setOwnedAvatars(JSON.parse(storedOwnedAvatars));
    if (storedCurrentAvatar) setCurrentAvatar(storedCurrentAvatar);
  }, []);

  const buyAvatar = (avatar: Avatar) => {
    if (ownedAvatars.includes(avatar.id)) {
      setCurrentAvatar(avatar.image);
      localStorage.setItem("currentAvatar", avatar.image);

      // Update userData in localStorage
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      userData.avatar = avatar.image;
      localStorage.setItem("userData", JSON.stringify(userData));

      toast({
        title: "Avatar Changed",
        description: `You're now using the ${avatar.name} avatar.`,
        variant: "default",
      });
      return;
    }

    if (coins >= avatar.price) {
      const newCoins = coins - avatar.price;
      const newOwnedAvatars = [...ownedAvatars, avatar.id];

      setCoins(newCoins);
      setOwnedAvatars(newOwnedAvatars);
      setCurrentAvatar(avatar.image);

      localStorage.setItem("userCoins", newCoins.toString());
      localStorage.setItem("ownedAvatars", JSON.stringify(newOwnedAvatars));
      localStorage.setItem("currentAvatar", avatar.image);

      // Update userData in localStorage
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      userData.avatar = avatar.image;
      localStorage.setItem("userData", JSON.stringify(userData));

      toast({
        title: "Avatar Purchased!",
        description: `You've successfully bought ${avatar.name} and set it as your profile picture.`,
      });
    } else {
      toast({
        title: "Insufficient Coins",
        description: "You don't have enough coins to buy this avatar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-purple-100 p-4 pb-20">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/home")}
            className="mr-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-purple-800">Shop</h1>
        </div>
        <div className="flex items-center">
          <Coins className="w-6 h-6 mr-2 text-yellow-500" />
          <span className="font-bold text-purple-600">{coins}</span>
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-purple-700">Avatars</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                className="flex flex-col items-center p-4 border rounded-lg"
              >
                <img
                  src={avatar.image || "/placeholder.svg"}
                  alt={avatar.name}
                  width={80}
                  height={80}
                  className="rounded-full mb-2"
                />
                <h3 className="font-semibold text-center mb-1">
                  {avatar.name}
                </h3>
                <p className="text-purple-600 mb-2 flex items-center">
                  <Coins className="w-4 h-4 mr-1 text-yellow-500" />
                  {avatar.price}
                </p>
                <Button
                  onClick={() => buyAvatar(avatar)}
                  className={`w-full ${
                    ownedAvatars.includes(avatar.id)
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {ownedAvatars.includes(avatar.id)
                    ? currentAvatar === avatar.image
                      ? "Current"
                      : "Use"
                    : "Buy"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
