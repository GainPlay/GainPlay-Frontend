import { Friendship, FrontendUserData } from "@/types";
import axios from "axios";

export const friendsService = {
  getFriends: async (): Promise<Friendship[]> => {
    return (await axios.get("/friendships")).data;
  },

  getFriendship: async (friendId: number): Promise<Friendship> => {
    return (await axios.get(`/friendships/friendId/${friendId}`)).data;
  },

  getDiscover: async (): Promise<FrontendUserData[]> => {
    return (await axios.get("/friendships/discover")).data;
  },
  sendFriendRequest: async (
    friendship: Partial<Friendship>
  ): Promise<Friendship> => {
    return (await axios.post("/friendships", friendship)).data;
  },
  updateFriendship: async (
    id: number,
    updatedFriendship: Partial<Friendship>
  ): Promise<Friendship> => {
    return (await axios.put(`/friendships/${id}`, updatedFriendship)).data;
  },
  deleteFriendship: async (friendshipId: number): Promise<void> => {
    await axios.delete(`/friendships/${friendshipId}`);
  }
};
