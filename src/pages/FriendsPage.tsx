import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Users,
  ArrowLeft,
  X,
  UserCheck,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Star,
  Crown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { FrontendUserData } from "@/types";
import { friendsService } from "@/services/friendsService";
import { mapFriendshipsToFrontend } from "@/utils/friendshipsUtils";
import { allGoals } from "@/utils/constants/friendships.consts";
import Navigation from "@/components/Navigation";
import { useUserStore } from "@/stores/useUserStore";

export default function FriendsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [myFriends, setMyFriends] = useState<FrontendUserData[]>([]);
  const [pendingRequest, setPendingRequest] = useState<FrontendUserData[]>([]);
  const [allDiscoverableUsers, setAllDiscoverableUsers] = useState<
    FrontendUserData[]
  >([]);
  const [filteredDiscoverableUsers, setFilteredDiscoverableUsers] = useState<
    FrontendUserData[]
  >([]);
  const user = useUserStore();

  useEffect(() => {
    const getFriendsData = async (): Promise<void> => {
      if (user.id) {
        const fetchedFriendships = await friendsService.getFriends();
        const { friends, pendingReceived } = mapFriendshipsToFrontend(
          fetchedFriendships,
          user.id
        );
        setMyFriends(friends);
        setPendingRequest(pendingReceived);
        const fetchedDiscoverFriends = await friendsService.getDiscover();
        setAllDiscoverableUsers(fetchedDiscoverFriends);
      }
    };
    getFriendsData();
  }, [user.id]);

  useEffect(() => {
    handleSearch();
  }, [selectedGoals, searchTerm, allDiscoverableUsers]);

  const handleSearch = (): void => {
    const filtered = allDiscoverableUsers.filter((friend) => {
      const nameMatch = friend.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const emailMatch = friend.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const goalsMatch =
        selectedGoals.length === 0 ||
        selectedGoals.some((goal) =>
          friend.user_goals?.some((userGoal) => userGoal.goals.name === goal)
        );
      return (nameMatch || emailMatch) && goalsMatch;
    });

    setFilteredDiscoverableUsers(filtered);
    setShowEmptyState(filtered.length === 0);
  };

  const handleGoalToggle = (goal: string): void => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const clearFilters = (): void => {
    setSelectedGoals([]);
  };

  const navigateToUserProfile = (userId: number): void => {
    navigate(`/user-profile/${userId}`);
  };

  // Get level icon based on level
  const getLevelIcon = (level: number) => {
    if (level >= 20) return Crown;
    if (level >= 10) return Star;
    return Zap;
  };

  // Get level color based on level
  const getLevelColor = (level: number) => {
    if (level >= 20) return "text-yellow-600 bg-yellow-100";
    if (level >= 10) return "text-purple-600 bg-purple-100";
    return "text-blue-600 bg-blue-100";
  };

  const FriendCard = ({
    friend,
    variant = "default",
  }: {
    friend: FrontendUserData;
    variant?: "default" | "friend" | "request";
  }) => {
    const LevelIcon = getLevelIcon(friend.level || 1);
    const levelColorClass = getLevelColor(friend.level || 1);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        whileTap={{ scale: 0.98 }}
        className="w-full"
        onClick={() => navigateToUserProfile(friend.id)}
      >
        <Card
          className={cn(
            "overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border-0 rounded-2xl",
            variant === "friend" &&
              "ring-1 ring-green-200 bg-gradient-to-br from-green-50/50 to-white/80",
            variant === "request" &&
              "ring-1 ring-amber-200 bg-gradient-to-br from-amber-50/50 to-white/80"
          )}
        >
          <div className="p-5">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16 ring-2 ring-white shadow-md">
                  <AvatarImage
                    src={friend.avatar_url || "/placeholder.svg"}
                    alt={friend.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white font-semibold text-lg">
                    {(friend?.name ?? "?").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 rounded-full h-7 w-7 flex items-center justify-center shadow-sm ring-2 ring-white",
                    levelColorClass
                  )}
                >
                  <LevelIcon className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-lg truncate">
                    {friend.name}
                  </h3>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-600">
                    Level {friend.level || 1}
                  </span>
                  {variant === "request" && (
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-700 border-amber-300 text-xs px-2 py-0.5"
                    >
                      Pending
                    </Badge>
                  )}
                  {variant === "friend" && (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-700 border-green-300 text-xs px-2 py-0.5"
                    >
                      Friend
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {friend.user_goals?.slice(0, 2).map((goal, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-purple-100 text-purple-700 border-0 text-xs px-2 py-1 font-medium"
                    >
                      {goal.goals.name}
                    </Badge>
                  ))}
                  {(friend.user_goals?.length ?? 0) > 2 && (
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-600 border-0 text-xs px-2 py-1"
                    >
                      +{(friend.user_goals?.length ?? 0) - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/30">
        <div className="px-4 py-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/home")}
                className="p-2 hover:bg-purple-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-purple-700" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                  Friends
                </h1>
                <p className="text-purple-600/70 text-sm mt-1">
                  Connect with your fitness community
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="discover" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm border-0">
              <TabsTrigger
                value="discover"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl font-medium transition-all"
              >
                <Users className="w-4 h-4 mr-2" />
                Discover
              </TabsTrigger>
              <TabsTrigger
                value="my-friends"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl font-medium transition-all"
              >
                <span className="flex items-center">
                  <UserCheck className="w-4 h-4 mr-2" />
                  My Friends
                  {myFriends.length > 0 && (
                    <span className="ml-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-sm">
                      {myFriends.length}
                    </span>
                  )}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl font-medium transition-all relative"
              >
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-2"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M15 8h6" />
                    <path d="M18 5v6" />
                  </svg>
                  Requests
                  {pendingRequest.length > 0 && (
                    <span className="ml-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-sm">
                      {pendingRequest.length}
                    </span>
                  )}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-6">
              {/* Search */}
              <div className="space-y-4">
                <div
                  className={cn(
                    "flex items-center relative transition-all duration-200 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border-0",
                    isSearchFocused ? "ring-2 ring-purple-300 shadow-md" : ""
                  )}
                >
                  <Search
                    className={cn(
                      "absolute left-4 w-5 h-5 transition-colors",
                      isSearchFocused ? "text-purple-600" : "text-gray-400"
                    )}
                  />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-12 py-6 border-none shadow-none focus-visible:ring-0 bg-transparent text-gray-900 placeholder:text-gray-500 rounded-2xl"
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Filters */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="bg-white/80 backdrop-blur-sm text-purple-700 border-purple-200 hover:bg-purple-50 rounded-xl px-4 py-2 font-medium"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filter by Goals
                      {showFilters ? (
                        <ChevronUp className="ml-2 w-4 h-4" />
                      ) : (
                        <ChevronDown className="ml-2 w-4 h-4" />
                      )}
                    </Button>

                    {selectedGoals.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-purple-600 hover:bg-purple-50 rounded-xl px-3 py-2"
                      >
                        Clear ({selectedGoals.length})
                      </Button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <Card className="p-5 bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
                          <div className="flex flex-wrap gap-2.5">
                            {allGoals.map((goal) => (
                              <motion.button
                                key={goal}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                  "px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center font-medium text-sm",
                                  selectedGoals.includes(goal)
                                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                )}
                                onClick={() => handleGoalToggle(goal)}
                              >
                                {selectedGoals.includes(goal) && (
                                  <X className="w-3.5 h-3.5 mr-1.5" />
                                )}
                                {goal}
                              </motion.button>
                            ))}
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {selectedGoals.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedGoals.map((goal) => (
                        <Badge
                          key={goal}
                          className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-xl cursor-pointer transition-colors border-0"
                          onClick={() => handleGoalToggle(goal)}
                        >
                          {goal}
                          <X className="ml-1.5 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Results */}
              <AnimatePresence>
                {showEmptyState ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex flex-col items-center justify-center p-12 bg-white/60 backdrop-blur-sm rounded-3xl"
                  >
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                      <Users className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Users Found
                    </h3>
                    <p className="text-gray-600 text-center mb-6 max-w-sm">
                      We couldn't find anyone matching your search criteria. Try
                      adjusting your filters.
                    </p>
                    <Button
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md"
                    >
                      Clear Filters
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredDiscoverableUsers.map((friend, index) => (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <FriendCard friend={friend} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="my-friends" className="space-y-6">
              {myFriends.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {myFriends.map((friend, index) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <FriendCard friend={friend} variant="friend" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white/60 backdrop-blur-sm rounded-3xl">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Users className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Friends Yet
                  </h3>
                  <p className="text-gray-600 text-center mb-6 max-w-sm">
                    You haven't added any friends yet. Discover and connect with
                    other fitness enthusiasts!
                  </p>
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md">
                    Find Friends
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              {pendingRequest.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {pendingRequest.map((friend, index) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <FriendCard friend={friend} variant="request" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white/60 backdrop-blur-sm rounded-3xl">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-10 h-10 text-amber-500"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M15 8h6" />
                      <path d="M18 5v6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Friend Requests
                  </h3>
                  <p className="text-gray-600 text-center max-w-sm">
                    You don't have any pending friend requests at the moment.
                    Keep being active to attract new connections!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Navigation />
    </>
  );
}
