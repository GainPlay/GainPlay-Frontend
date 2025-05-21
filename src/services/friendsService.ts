import { Friendship, FrontendUserData } from "@/types";
import axios from "axios";
import { getTokens } from "./authService";

export const friendsService = {
  getFriends: async (): Promise<Friendship[]> => {
    const access_token = getTokens().accessToken;
    return (
      await axios.get("/friendships", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).data;
  },

  getFriendship: async (friendId: number): Promise<Friendship> => {
    return (await axios.get(`/friendships/friendId/${friendId}`)).data;
  },

  getDiscover: async (): Promise<FrontendUserData[]> => {
    const access_token = getTokens().accessToken;
    return (
      await axios.get("/friendships/discover", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).data;
  },
  sendFriendRequest: async (friendship: Partial<Friendship>): Promise<Friendship> => {
    return (await axios.post("/friendships", friendship)).data;
  },
  updateFriendship: async (id: number, updatedfriendship: Partial<Friendship>): Promise<Friendship> => {
    return (await axios.put(`/friendships/${id}`, updatedfriendship)).data;
  },
  deleteFriendship: async (friendshipId: number): Promise<void> => {
    await axios.delete(`/friendships/${friendshipId}`);
  },
};
