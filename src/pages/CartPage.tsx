import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Coins,
  CheckCircle,
  ChevronLeft,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Avatar = {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
};

const avatars: Avatar[] = [
  {
    id: "1",
    name: "Sporty Spice",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Sporty",
    price: 100,
    category: "sports",
    rarity: "common"
  },
  {
    id: "2",
    name: "Zen Master",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Zen",
    price: 150,
    category: "lifestyle",
    rarity: "common"
  },
  {
    id: "3",
    name: "Power Lifter",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Power",
    price: 200,
    category: "sports",
    rarity: "rare"
  },
  {
    id: "4",
    name: "Yoga Guru",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Yoga",
    price: 250,
    category: "lifestyle",
    rarity: "rare"
  },
  {
    id: "5",
    name: "Runner",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Runner",
    price: 300,
    category: "sports",
    rarity: "rare"
  },
  {
    id: "6",
    name: "Swimmer",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Swimmer",
    price: 350,
    category: "sports",
    rarity: "epic"
  },
  {
    id: "7",
    name: "Cyclist",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Cyclist",
    price: 400,
    category: "sports",
    rarity: "epic"
  },
  {
    id: "8",
    name: "Boxer",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Boxer",
    price: 450,
    category: "sports",
    rarity: "legendary"
  },
  {
    id: "9",
    name: "Ninja",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Ninja",
    price: 500,
    category: "fantasy",
    rarity: "legendary"
  },
  {
    id: "10",
    name: "Wizard",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Wizard",
    price: 550,
    category: "fantasy",
    rarity: "legendary"
  },
  {
    id: "11",
    name: "Astronaut",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Astronaut",
    price: 600,
    category: "fantasy",
    rarity: "legendary"
  },
  {
    id: "12",
    name: "Pirate",
    image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Pirate",
    price: 650,
    category: "fantasy",
    rarity: "epic"
  }
];

const rarityColors = {
  common: "bg-gray-200 text-gray-700",
  rare: "bg-blue-200 text-blue-700",
  epic: "bg-purple-200 text-purple-700",
  legendary: "bg-yellow-200 text-yellow-700"
};

export default function CartPage() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);
  const [ownedAvatars, setOwnedAvatars] = useState<string[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(false);
  const [purchasedAvatar, setPurchasedAvatar] = useState<Avatar | null>(null);
  const [filteredAvatars, setFilteredAvatars] = useState(avatars);
  const shopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedCoins = localStorage.getItem("userCoins");
    const storedOwnedAvatars = localStorage.getItem("ownedAvatars");
    const storedCurrentAvatar = localStorage.getItem("currentAvatar");

    if (storedCoins) setCoins(Number.parseInt(storedCoins));
    if (storedOwnedAvatars) setOwnedAvatars(JSON.parse(storedOwnedAvatars));
    if (storedCurrentAvatar) setCurrentAvatar(storedCurrentAvatar);
  }, []);

  useEffect(() => {
    let filtered = avatars;

    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (avatar) => avatar.category === activeCategory
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((avatar) =>
        avatar.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAvatars(filtered);
  }, [activeCategory, searchTerm]);

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
        variant: "default"
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

      // Show purchase animation
      setPurchasedAvatar(avatar);
      setShowPurchaseAnimation(true);
      setTimeout(() => {
        setShowPurchaseAnimation(false);
      }, 2000);

      toast({
        title: "Avatar Purchased!",
        description: `You've successfully bought ${avatar.name} and set it as your profile picture.`
      });
    } else {
      toast({
        title: "Insufficient Coins",
        description: (
          <div className="flex items-center">
            <Coins className="w-5 h-5 text-yellow-500 mr-2" />
            <span>
              You need {avatar.price - coins} more coins to buy this avatar.
            </span>
          </div>
        ),
        variant: "destructive"
      });
    }
  };

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);

    // Scroll to top when selecting an avatar on mobile
    if (window.innerWidth < 768 && shopRef.current) {
      shopRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  const handleCloseDetails = () => {
    setSelectedAvatar(null);
  };

  const categories = [
    { id: "all", name: "All" },
    { id: "sports", name: "Sports" },
    { id: "lifestyle", name: "Lifestyle" },
    { id: "fantasy", name: "Fantasy" }
  ];

  return (
    <div
      ref={shopRef}
      className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-4 pb-20"
    >
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/home")}
            className="mr-2 p-2"
          >
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </Button>
          <h1 className="text-2xl font-bold text-purple-800">Shop</h1>
        </div>
        <div className="flex items-center bg-white px-3 py-2 rounded-full shadow-md">
          <Coins className="w-5 h-5 mr-2 text-yellow-500" />
          <span className="font-bold text-purple-600">{coins}</span>
        </div>
      </header>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search avatars..."
            className="pl-10 bg-white border-none shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            className={`mr-2 whitespace-nowrap ${
              activeCategory === category.id
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-white hover:bg-purple-50"
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar details panel (visible on larger screens or when selected on mobile) */}
        <AnimatePresence mode="wait">
          {(selectedAvatar || window.innerWidth >= 768) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full md:w-1/3 md:sticky md:top-4 md:self-start"
            >
              <Card className="bg-white shadow-lg border-none overflow-hidden">
                <div className="md:hidden flex justify-end p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseDetails}
                    className="rounded-full h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Back</span>
                  </Button>
                </div>

                <div className="p-6 flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center overflow-hidden">
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                          rotate: [0, 2, -2, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse"
                        }}
                        className="w-28 h-28"
                      >
                        <img
                          src={selectedAvatar?.image || avatars[0].image}
                          alt={selectedAvatar?.name || avatars[0].name}
                          width={112}
                          height={112}
                          className="rounded-full"
                        />
                      </motion.div>
                    </div>

                    <Badge
                      className={cn(
                        "absolute -top-1 -right-1 px-2 py-1",
                        rarityColors[selectedAvatar?.rarity || "common"]
                      )}
                    >
                      {selectedAvatar?.rarity || "common"}
                    </Badge>
                  </div>

                  <h2 className="text-xl font-bold text-purple-800 mb-1">
                    {selectedAvatar?.name || avatars[0].name}
                  </h2>

                  <div className="flex items-center mb-6">
                    <Coins className="w-4 h-4 mr-1 text-yellow-500" />
                    <span className="font-semibold text-purple-600">
                      {selectedAvatar?.price || avatars[0].price}
                    </span>
                  </div>

                  {ownedAvatars.includes(
                    selectedAvatar?.id || avatars[0].id
                  ) ? (
                    <Button
                      onClick={() => buyAvatar(selectedAvatar || avatars[0])}
                      className={cn(
                        "w-full relative overflow-hidden",
                        currentAvatar ===
                          (selectedAvatar?.image || avatars[0].image)
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      )}
                      disabled={!selectedAvatar && window.innerWidth >= 768}
                    >
                      {currentAvatar ===
                      (selectedAvatar?.image || avatars[0].image) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Current
                        </>
                      ) : (
                        "Use"
                      )}
                      <span className="absolute inset-0 overflow-hidden">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -translate-x-full hover:translate-x-full transition-all duration-1000"></span>
                      </span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => buyAvatar(selectedAvatar || avatars[0])}
                      className={cn(
                        "w-full relative overflow-hidden",
                        "bg-purple-600 hover:bg-purple-700"
                      )}
                      disabled={
                        (!selectedAvatar && window.innerWidth >= 768) ||
                        coins < (selectedAvatar?.price || avatars[0].price)
                      }
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      Buy
                      <span className="absolute inset-0 overflow-hidden">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -translate-x-full hover:translate-x-full transition-all duration-1000"></span>
                      </span>
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar grid */}
        <div
          className={`flex-1 ${
            selectedAvatar && window.innerWidth < 768 ? "hidden" : ""
          }`}
        >
          <Tabs defaultValue="grid" className="mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-purple-800">
                {filteredAvatars.length} Avatars
              </h2>
              <TabsList className="bg-white">
                <TabsTrigger value="grid">
                  <div className="grid grid-cols-3 gap-0.5 h-4 w-4">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-current rounded-sm" />
                    ))}
                  </div>
                </TabsTrigger>
                <TabsTrigger value="list">
                  <div className="flex flex-col gap-0.5 h-4 w-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-current h-1 w-full rounded-sm"
                      />
                    ))}
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAvatars.map((avatar) => (
                  <motion.div
                    key={avatar.id}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer overflow-hidden border-2 transition-all duration-200",
                        selectedAvatar?.id === avatar.id
                          ? "border-purple-500 shadow-lg shadow-purple-200"
                          : "border-transparent hover:border-purple-300"
                      )}
                      onClick={() => handleAvatarSelect(avatar)}
                    >
                      <div className="relative pt-4">
                        <div className="flex justify-center">
                          <div className="relative w-20 h-20">
                            <img
                              src={avatar.image || "/placeholder.svg"}
                              alt={avatar.name}
                              width={80}
                              height={80}
                              className="rounded-full"
                            />
                            {ownedAvatars.includes(avatar.id) && (
                              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                                <CheckCircle className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "absolute top-2 right-2 text-xs",
                            rarityColors[avatar.rarity]
                          )}
                        >
                          {avatar.rarity}
                        </Badge>
                      </div>
                      <CardContent className="p-3 text-center">
                        <h3 className="font-medium text-sm mb-1 truncate">
                          {avatar.name}
                        </h3>
                        <div className="flex items-center justify-center">
                          <Coins className="w-3 h-3 mr-1 text-yellow-500" />
                          <span className="text-xs font-semibold">
                            {avatar.price}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-4">
              <div className="space-y-3">
                {filteredAvatars.map((avatar) => (
                  <motion.div
                    key={avatar.id}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer overflow-hidden border-l-4 transition-all duration-200",
                        selectedAvatar?.id === avatar.id
                          ? "border-l-purple-500 shadow-md"
                          : "border-l-transparent hover:border-l-purple-300"
                      )}
                      onClick={() => handleAvatarSelect(avatar)}
                    >
                      <CardContent className="p-3 flex items-center">
                        <div className="relative mr-3">
                          <img
                            src={avatar.image || "/placeholder.svg"}
                            alt={avatar.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          {ownedAvatars.includes(avatar.id) && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                              <CheckCircle className="w-2 h-2" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{avatar.name}</h3>
                          <Badge
                            className={cn(
                              "text-xs",
                              rarityColors[avatar.rarity]
                            )}
                          >
                            {avatar.rarity}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Coins className="w-4 h-4 mr-1 text-yellow-500" />
                          <span className="font-semibold">{avatar.price}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Purchase animation overlay */}
      <AnimatePresence>
        {showPurchaseAnimation && purchasedAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-xs w-full"
            >
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{
                  scale: [0.8, 1.2, 1],
                  rotate: [-10, 10, 0],
                  y: [0, -20, 0]
                }}
                transition={{ duration: 0.6 }}
                className="relative mb-4"
              >
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50"></div>
                <div className="relative z-10">
                  <img
                    src={purchasedAvatar.image || "/placeholder.svg"}
                    alt={purchasedAvatar.name}
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-white shadow-lg"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-bold text-center text-purple-800 mb-2">
                  Avatar Unlocked!
                </h3>
                <p className="text-purple-600 text-center mb-1">
                  {purchasedAvatar.name} is now yours!
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
