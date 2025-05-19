// import type { UserData, Friend, UserGoal, Exercise } from "../types";
// import { defaultUserData, friends } from "../data/mockData";
// import apiClient from "./apiClient";

import { Friendship, FrontendUserData } from "@/types";
import axios from "axios";

export const friendsService = {
  getFriends: async (userId: number): Promise<Friendship[]> => {
    return (
      await axios.get("/friendships", {
        params: { userId: userId }
      })
    ).data;
  },

  getFriendship: async (
    userId: number,
    friendId: number
  ): Promise<Friendship> => {
    return (
      await axios.get(`/friendships/userId/${userId}/friendId/${friendId}`)
    ).data;
  },

  getDiscover: async (userId: number): Promise<FrontendUserData[]> => {
    return (
      await axios.get("/friendships/discover", {
        params: { userId: userId }
      })
    ).data;
  },
  sendFriendRequest: async (
    friendship: Partial<Friendship>
  ): Promise<Friendship> => {
    return (await axios.post("/friendships", friendship)).data;
  },
  updateFriendship: async (
    id: number,
    updatedfriendship: Partial<Friendship>
  ): Promise<Friendship> => {
    return (await axios.put(`/friendships/${id}`, updatedfriendship)).data;
  },
  deleteFriendship: async (friendshipId: number): Promise<void> => {
    await axios.delete(`/friendships/${friendshipId}`);
  }
};
