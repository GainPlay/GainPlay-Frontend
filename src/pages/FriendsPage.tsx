import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Users, ArrowLeft, X, UserCheck, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
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
  const [allDiscoverableUsers, setAllDiscoverableUsers] = useState<FrontendUserData[]>([]);
  const [filteredDiscoverableUsers, setFilteredDiscoverableUsers] = useState<FrontendUserData[]>([]);
  const user = useUserStore();

  useEffect(() => {
    const getFriendsData = async (): Promise<void> => {
      const fetchedFriendships = await friendsService.getFriends();
      const { friends, pendingReceived } = mapFriendshipsToFrontend(fetchedFriendships, user.id);
      setMyFriends(friends);
      setPendingRequest(pendingReceived);
      const fetchedDiscoverFriends = await friendsService.getDiscover();
      setAllDiscoverableUsers(fetchedDiscoverFriends);
    };
    getFriendsData();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [selectedGoals, searchTerm, allDiscoverableUsers]);

  const handleSearch = (): void => {
    const filtered = allDiscoverableUsers.filter((friend) => {
      const nameMatch = friend.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = friend.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const goalsMatch =
        selectedGoals.length === 0 ||
        selectedGoals.some((goal) => friend.user_goals?.some((userGoal) => userGoal.goals.name === goal));
      return (nameMatch || emailMatch) && goalsMatch;
    });

    setFilteredDiscoverableUsers(filtered);
    setShowEmptyState(filtered.length === 0);
  };

  const handleGoalToggle = (goal: string): void => {
    setSelectedGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  };

  const clearFilters = (): void => {
    setSelectedGoals([]);
  };

  const navigateToUserProfile = (userId: number): void => {
    navigate(`/user-profile/${userId}`);
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-4 pb-20">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate("/home")} className="mr-2 p-2">
              <ArrowLeft className="w-6 h-6 text-purple-600" />
            </Button>
            <h1 className="text-2xl font-bold text-purple-800">Friends</h1>
          </div>
        </header>

        <Tabs defaultValue="discover" className="mb-6">
          <TabsList className="grid grid-cols-3 w-full bg-purple-50 p-1">
            <TabsTrigger value="discover" className="data-[state=active]:bg-white rounded-md">
              <Users className="w-4 h-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="my-friends" className="data-[state=active]:bg-white rounded-md">
              <UserCheck className="w-4 h-4 mr-2" />
              My Friends
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-white rounded-md relative">
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
                  <span className="ml-1.5 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingRequest.length}
                  </span>
                )}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-4 space-y-4">
            <div className="mb-4">
              <div
                className={cn(
                  "flex items-center relative transition-all duration-200 bg-white rounded-lg shadow-sm",
                  isSearchFocused ? "ring-2 ring-purple-300" : ""
                )}
              >
                <Search
                  className={cn(
                    "absolute left-3 w-5 h-5 transition-colors",
                    isSearchFocused ? "text-purple-600" : "text-gray-400"
                  )}
                />
                <Input
                  ref={searchInputRef}
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-none shadow-none focus-visible:ring-0"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 h-8 w-8 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white text-purple-700 border-purple-200"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Goals
                  {showFilters ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
                </Button>

                {selectedGoals.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-purple-600">
                    Clear filters
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
                    <Card className="p-4 bg-white mb-4">
                      <div className="flex flex-wrap gap-3">
                        {allGoals.map((goal) => (
                          <motion.div
                            key={goal}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "px-3 py-1.5 rounded-full cursor-pointer transition-all flex items-center",
                              selectedGoals.includes(goal)
                                ? "bg-purple-600 text-white"
                                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            )}
                            onClick={() => handleGoalToggle(goal)}
                          >
                            {selectedGoals.includes(goal) && <X className="w-3.5 h-3.5 mr-1.5" />}
                            {goal}
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedGoals.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedGoals.map((goal) => (
                    <Badge
                      key={goal}
                      className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1"
                      onClick={() => handleGoalToggle(goal)}
                    >
                      {goal}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <AnimatePresence>
              {showEmptyState ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm"
                >
                  <Users className="w-16 h-16 text-purple-200 mb-4" />
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">No Users Found</h3>
                  <p className="text-purple-600 text-center mb-4">
                    We couldn't find anyone matching your search criteria.
                  </p>
                  <Button onClick={clearFilters} className="bg-purple-600 hover:bg-purple-700">
                    Clear Filters
                  </Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDiscoverableUsers.map((friend) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5 }}
                      className="w-full"
                      onClick={() => navigateToUserProfile(friend.id)}
                    >
                      <Card className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                        <div className="p-4">
                          <div className="flex items-center">
                            <div className="relative">
                              <Avatar className="h-14 w-14 border-2 border-purple-100">
                                <AvatarImage src={friend.avatar_url || "/placeholder.svg"} alt={friend.name} />
                                <AvatarFallback className="bg-purple-200 text-purple-700">
                                  {(friend?.name ?? "?").charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {friend.level}
                              </div>
                            </div>
                            <div className="ml-4 flex-grow">
                              <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-purple-900">{friend.name}</h2>
                                <ChevronRight className="h-5 w-5 text-purple-400" />
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {friend.user_goals?.slice(0, 1).map((goal, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                                  >
                                    {goal.goals.name}
                                  </Badge>
                                ))}
                                {(friend.user_goals?.length ?? 0) > 1 && (
                                  <Badge
                                    variant="outline"
                                    className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                                  >
                                    +{(friend.user_goals?.length ?? 0) - 1} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="my-friends" className="mt-4">
            <div className="space-y-4">
              {myFriends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myFriends.map((friend) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5 }}
                      className="w-full"
                      onClick={() => navigateToUserProfile(friend.id)}
                    >
                      <Card className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                        <div className="p-4">
                          <div className="flex items-center">
                            <div className="relative">
                              <Avatar className="h-14 w-14 border-2 border-green-100">
                                <AvatarImage src={friend.avatar_url || "/placeholder.svg"} alt={friend.name} />
                                <AvatarFallback className="bg-green-200 text-green-700">
                                  {(friend?.name ?? "?").charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {friend.level}
                              </div>
                            </div>
                            <div className="ml-4 flex-grow">
                              <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-purple-900">{friend.name}</h2>
                                <ChevronRight className="h-5 w-5 text-purple-400" />
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {friend.user_goals?.slice(0, 1).map((goal, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 text-xs"
                                  >
                                    {goal.goals.name}
                                  </Badge>
                                ))}
                                {(friend.user_goals?.length ?? 0) > 1 && (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 text-xs"
                                  >
                                    +{(friend.user_goals?.length ?? 0) - 1} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
                  <Users className="w-16 h-16 text-purple-200 mb-4" />
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">No Friends Yet</h3>
                  <p className="text-purple-600 text-center mb-4">
                    You haven't added any friends yet. Discover and connect with other users!
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">Find Friends</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            <div className="space-y-4">
              {pendingRequest.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingRequest.map((friend) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5 }}
                      className="w-full"
                      onClick={() => navigateToUserProfile(friend.id)}
                    >
                      <Card className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-amber-400">
                        <div className="p-4">
                          <div className="flex items-center">
                            <div className="relative">
                              <Avatar className="h-14 w-14 border-2 border-amber-100">
                                <AvatarImage src={friend.avatar_url || "/placeholder.svg"} alt={friend.name} />
                                <AvatarFallback className="bg-amber-200 text-amber-700">
                                  {(friend?.name ?? "?").charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {friend.level}
                              </div>
                            </div>
                            <div className="ml-4 flex-grow">
                              <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-purple-900">{friend.name}</h2>
                                <ChevronRight className="h-5 w-5 text-purple-400" />
                              </div>
                              <p className="text-xs text-amber-600 mt-1">Wants to connect with you</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-16 h-16 text-purple-200 mb-4"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M15 8h6" />
                    <path d="M18 5v6" />
                  </svg>
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">No Friend Requests</h3>
                  <p className="text-purple-600 text-center mb-4">
                    You don't have any pending friend requests at the moment.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Navigation />
    </>
  );
}
