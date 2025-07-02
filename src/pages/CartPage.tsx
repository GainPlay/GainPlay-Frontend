import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Coins,
  CheckCircle,
  ChevronLeft,
  Search,
  Star,
  Sparkles,
  Crown,
  Gem,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { avatarService } from "@/services/avatarService";
import { FrontendAvatar } from "@/types";
import { useUserStore } from "@/stores/useUserStore";
import Navigation from "@/components/Navigation";

const rarityConfig = {
  common: {
    colors: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Star,
    gradient: "from-slate-100 to-slate-200",
  },
  rare: {
    colors: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Sparkles,
    gradient: "from-blue-100 to-blue-200",
  },
  epic: {
    colors: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Gem,
    gradient: "from-purple-100 to-purple-200",
  },
  legendary: {
    colors:
      "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200",
    icon: Crown,
    gradient: "from-yellow-100 to-orange-200",
  },
};

export default function CartPage() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);
  const [avatars, setAvatars] = useState<FrontendAvatar[]>([]);
  const [ownedAvatars, setOwnedAvatars] = useState<number[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState<number | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<FrontendAvatar | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(false);
  const [purchasedAvatar, setPurchasedAvatar] = useState<FrontendAvatar | null>(
    null
  );
  const [filteredAvatars, setFilteredAvatars] = useState<FrontendAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);
  const user = useUserStore();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load avatars and user data in parallel
        const [avatarsData, userAvatarsData] = await Promise.all([
          avatarService.getAvatars(),
          avatarService.getOwnedAvatars(),
        ]);

        setAvatars(avatarsData);

        // Extract owned avatar IDs and current avatar from user avatars data
        const ownedIds = userAvatarsData.map((ua) => ua.avatars.id);
        const current =
          userAvatarsData.find((ua) => ua.is_current)?.avatars.id || null;

        setOwnedAvatars(ownedIds);
        setCurrentAvatar(current);

        const userCoins = user.coins;
        if (userCoins) {
          setCoins(userCoins);
        }

        // Don't auto-select any avatar on load
      } catch (error) {
        console.error("Failed to load data:", error);
        toast({
          title: "Error",
          description: "Failed to load avatar data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update current avatar when user store changes
  useEffect(() => {
    if (user.avatar_url && avatars.length > 0) {
      const currentAvatarData = avatars.find(
        (avatar) => avatar.image_url === user.avatar_url
      );
      if (currentAvatarData) {
        setCurrentAvatar(currentAvatarData.id);
      }
    }
  }, [user.avatar_url, avatars]);

  // Filter avatars based on search and category
  useEffect(() => {
    let filtered = avatars;

    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter((avatar) => avatar.rarity === activeCategory);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((avatar) =>
        avatar.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAvatars(filtered);
  }, [avatars, activeCategory, searchTerm]);

  const buyAvatar = async (avatar: FrontendAvatar) => {
    if (ownedAvatars.includes(avatar.id)) {
      // User already owns this avatar, just set it as current
      try {
        setPurchasing(true);
        const newAvatarData = await avatarService.setCurrentAvatar(avatar.id);
        user.setUser({ avatar_url: newAvatarData.avatarUrl });
        setCurrentAvatar(avatar.id);

        toast({
          title: "Avatar Changed",
          description: `You're now using the ${avatar.name} avatar.`,
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to change avatar. Please try again.",
          variant: "destructive",
        });
      } finally {
        setPurchasing(false);
      }
      return;
    }

    if (coins >= avatar.price) {
      try {
        setPurchasing(true);

        // Purchase the avatar
        await avatarService.purchaseAvatar(avatar.id);

        // Update local state
        const newCoins = coins - avatar.price;
        const newOwnedAvatars = [...ownedAvatars, avatar.id];

        setCoins(newCoins);
        setOwnedAvatars(newOwnedAvatars);
        setCurrentAvatar(avatar.id);

        await avatarService.setCurrentAvatar(avatar.id);
        user.setUser({ coins: newCoins, avatar_url: avatar.image_url || "" });

        // Show purchase animation
        setPurchasedAvatar(avatar);
        setShowPurchaseAnimation(true);
        setTimeout(() => {
          setShowPurchaseAnimation(false);
        }, 2000);

        toast({
          title: "Avatar Purchased!",
          description: `You've successfully bought ${avatar.name} and set it as your profile picture.`,
        });
      } catch (error) {
        toast({
          title: "Purchase Failed",
          description:
            typeof error === "object" && error !== null && "message" in error
              ? (error as { message?: string }).message
              : "Failed to purchase avatar. Please try again.",
          variant: "destructive",
        });
      } finally {
        setPurchasing(false);
      }
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
        variant: "destructive",
      });
    }
  };

  const handleAvatarSelect = (avatar: FrontendAvatar) => {
    setSelectedAvatar(avatar);

    // Scroll to top when selecting an avatar on mobile
    if (window.innerWidth < 768 && shopRef.current) {
      shopRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleCloseDetails = () => {
    setSelectedAvatar(null);
  };

  // Create categories based on available rarities in the data
  const categories = [
    { id: "all", name: "All", count: avatars.length },
    ...["common", "rare", "epic", "legendary"]
      .filter((rarity) => avatars.some((avatar) => avatar.rarity === rarity))
      .map((rarity) => ({
        id: rarity,
        name: rarity.charAt(0).toUpperCase() + rarity.slice(1),
        count: avatars.filter((avatar) => avatar.rarity === rarity).length,
      })),
  ];

  const getRarityIcon = (rarity: FrontendAvatar["rarity"]) => {
    const IconComponent = rarityConfig[rarity]?.icon || Star;
    return <IconComponent className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
        <p className="text-purple-600">Loading avatars...</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={shopRef}
        className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 p-4 pb-20"
      >
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/home")}
              className="mr-3 p-2 hover:bg-purple-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-purple-600" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Avatar Shop
              </h1>
              <p className="text-purple-500 text-sm">
                Customize your fitness journey
              </p>
            </div>
          </div>
          <div className="flex items-center bg-gradient-to-r from-yellow-100 to-yellow-200 px-4 py-3 rounded-2xl shadow-lg border border-yellow-300">
            <Coins className="w-6 h-6 mr-2 text-yellow-600" />
            <span className="font-bold text-yellow-800 text-lg">
              {coins.toLocaleString()}
            </span>
          </div>
        </header>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <Input
              placeholder="Search for your perfect avatar..."
              className="pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-purple-200 rounded-2xl shadow-sm focus:shadow-md transition-all duration-200 text-purple-700 placeholder:text-purple-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className={cn(
                "whitespace-nowrap rounded-xl px-4 py-2 font-medium transition-all duration-200",
                activeCategory === category.id
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-200"
                  : "bg-white/80 backdrop-blur-sm hover:bg-purple-50 border-purple-200 text-purple-600"
              )}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
              <Badge className="ml-2 bg-purple-100 text-purple-600 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar Details Panel */}
          <AnimatePresence mode="wait">
            {selectedAvatar && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full lg:w-96 lg:sticky lg:top-4 lg:self-start"
              >
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 overflow-hidden rounded-3xl">
                  {/* Mobile Close Button */}
                  <div className="lg:hidden flex justify-between items-center p-4 border-b border-purple-100">
                    <h3 className="font-semibold text-purple-800">
                      Avatar Details
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseDetails}
                      className="rounded-full h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="p-8">
                    {/* Avatar Display */}
                    <div className="relative mb-6 flex justify-center">
                      <div className="relative w-40 h-40 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 2, -2, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                          }}
                          className="w-full h-full"
                        >
                          <img
                            src={selectedAvatar.image_url || "/placeholder.svg"}
                            alt={selectedAvatar.name}
                            className="rounded-3xl w-full h-full object-cover"
                          />
                        </motion.div>
                      </div>
                    </div>

                    {/* Avatar Info */}
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-purple-800 mb-2">
                        {selectedAvatar.name}
                      </h2>

                      {/* Rarity Badge */}
                      <div className="flex justify-center mb-3">
                        <Badge
                          className={cn(
                            "px-4 py-2 rounded-xl font-medium shadow-lg",
                            rarityConfig[selectedAvatar.rarity]?.colors ||
                              rarityConfig.common.colors
                          )}
                        >
                          {getRarityIcon(selectedAvatar.rarity)}
                          <span className="ml-2 capitalize">
                            {selectedAvatar.rarity}
                          </span>
                        </Badge>
                      </div>

                      {/* Owned Indicator */}
                      {ownedAvatars.includes(selectedAvatar.id) && (
                        <div className="flex justify-center items-center mb-3">
                          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-200">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">Owned</span>
                          </div>
                        </div>
                      )}

                      <p className="text-purple-600 text-sm mb-4">
                        Transform your fitness journey
                      </p>

                      <div className="flex items-center justify-center bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl px-4 py-3 border border-yellow-300">
                        <Coins className="w-5 h-5 mr-2 text-yellow-600" />
                        <span className="font-bold text-yellow-800 text-lg">
                          {selectedAvatar.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {ownedAvatars.includes(selectedAvatar.id) ? (
                      <Button
                        onClick={() => buyAvatar(selectedAvatar)}
                        className={cn(
                          "w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg",
                          currentAvatar === selectedAvatar.id
                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-200 cursor-not-allowed opacity-75"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-200"
                        )}
                        disabled={
                          purchasing || currentAvatar === selectedAvatar.id
                        }
                      >
                        {purchasing ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : currentAvatar === selectedAvatar.id ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Currently Active
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Use Avatar
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => buyAvatar(selectedAvatar)}
                        className="w-full py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-200 transition-all duration-200"
                        disabled={coins < selectedAvatar.price || purchasing}
                      >
                        {purchasing ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <>
                            <Coins className="w-5 h-5 mr-2" />
                            {coins < selectedAvatar.price
                              ? "Insufficient Coins"
                              : "Purchase Avatar"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Avatar Grid */}
          <div
            className={`flex-1 ${
              selectedAvatar && window.innerWidth < 1024 ? "hidden" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-purple-800">
                  {filteredAvatars.length} Avatar
                  {filteredAvatars.length !== 1 ? "s" : ""} Available
                </h2>
                <p className="text-purple-500 text-sm">
                  Choose your fitness persona
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredAvatars.map((avatar, index) => (
                <motion.div
                  key={avatar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={cn(
                      "cursor-pointer overflow-hidden border-2 transition-all duration-300 rounded-2xl bg-white/80 backdrop-blur-sm",
                      selectedAvatar?.id === avatar.id
                        ? "border-purple-400 shadow-lg shadow-purple-200 bg-purple-50/50"
                        : "border-transparent hover:border-purple-300 hover:shadow-lg"
                    )}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    <div className="relative p-6">
                      {/* Owned Badge - moved to top-left of the card */}
                      {ownedAvatars.includes(avatar.id) && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-2 shadow-lg border-2 border-white z-10">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}

                      {/* Avatar Image */}
                      <div className="flex justify-center mb-4">
                        <div
                          className={cn(
                            "relative w-24 h-24 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center overflow-hidden",
                            `bg-gradient-to-br ${
                              rarityConfig[avatar.rarity]?.gradient ||
                              rarityConfig.common.gradient
                            }`
                          )}
                        >
                          <img
                            src={avatar.image_url || "/placeholder.svg"}
                            alt={avatar.name}
                            width={80}
                            height={80}
                            className="rounded-xl border-2 border-white/50 w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Rarity Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge
                          className={cn(
                            "text-xs font-medium rounded-lg border shadow-sm",
                            rarityConfig[avatar.rarity]?.colors ||
                              rarityConfig.common.colors
                          )}
                        >
                          {getRarityIcon(avatar.rarity)}
                        </Badge>
                      </div>

                      {/* Avatar Info */}
                      <div className="text-center">
                        <h3 className="font-bold text-purple-800 mb-1 truncate">
                          {avatar.name}
                        </h3>
                        {ownedAvatars.includes(avatar.id) ? (
                          <div className="flex items-center justify-center bg-green-100 rounded-lg px-3 py-1 border border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">
                              Owned
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center bg-yellow-100 rounded-lg px-3 py-1 border border-yellow-200">
                            <Coins className="w-3 h-3 mr-1 text-yellow-600" />
                            <span className="text-sm font-semibold text-yellow-800">
                              {avatar.price.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredAvatars.length === 0 && (
              <div className="text-center py-12">
                <div className="text-purple-300 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-purple-600 mb-2">
                  No avatars found
                </h3>
                <p className="text-purple-500">
                  Try adjusting your search or category filters
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Purchase Animation Overlay */}
        <AnimatePresence>
          {showPurchaseAnimation && purchasedAvatar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.5, y: 100, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4"
              >
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{
                    scale: [0.8, 1.2, 1],
                    rotate: [-10, 10, 0],
                    y: [0, -20, 0],
                  }}
                  transition={{ duration: 0.6 }}
                  className="relative mb-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl opacity-50"></div>
                  <div className="relative z-10">
                    <img
                      src={purchasedAvatar.image_url || "/placeholder.svg"}
                      alt={purchasedAvatar.name}
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-white shadow-lg w-full h-full object-cover"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <h3 className="text-2xl font-bold text-purple-800 mb-2">
                    🎉 Avatar Unlocked!
                  </h3>
                  <p className="text-purple-600 mb-1 font-medium">
                    {purchasedAvatar.name}
                  </p>
                  <p className="text-purple-500 text-sm">
                    Ready to start your fitness journey!
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Navigation />
    </>
  );
}
