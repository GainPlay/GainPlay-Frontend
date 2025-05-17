// import type { UserData, Friend, UserGoal, Exercise } from "../types";
// import { defaultUserData, friends } from "../data/mockData";
// import apiClient from "./apiClient";

import { Friendship, FrontendUserData } from "@/types";
import apiClient from "./apiClient";

export const friendsService = {
  getFriends: async (userId: number): Promise<Friendship[]> => {
    return (
      await apiClient.get("/friendships", {
        params: { userId: userId },
      })
    ).data;
  },

  getFriendship: async (userId: number, friendId: number): Promise<Friendship> => {
    return (await apiClient.get(`/friendships/userId/${userId}/friendId/${friendId}`)).data;
  },

  getDiscover: async (userId: number): Promise<FrontendUserData[]> => {
    return (
      await apiClient.get("/friendships/discover", {
        params: { userId: userId },
      })
    ).data;
  },
  sendFriendRequest: async (friendship: Partial<Friendship>): Promise<Friendship> => {
    return (await apiClient.post("/friendships", friendship)).data;
  },
  updateFriendship: async (id: number, updatedfriendship: Partial<Friendship>): Promise<Friendship> => {
    return (await apiClient.put(`/friendships/${id}`, updatedfriendship)).data;
  },
  deleteFriendship: async (friendshipId: number): Promise<void> => {
    await apiClient.delete(`/friendships/${friendshipId}`);
  },
};
