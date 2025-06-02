import { FrontendAvatar, UserAvatar } from "@/types";
import axios from "axios";

const API_BASE = "/avatars";

export const avatarService = {
  getAvatars: async (): Promise<FrontendAvatar[]> => {
    const res = await axios.get(API_BASE);
    return res.data;
  },

  getOwnedAvatars: async (): Promise<UserAvatar[]> => {
    const res = await axios.get(`${API_BASE}/user`);
    return res.data;
  },

  purchaseAvatar: async (
    avatarId: number
  ): Promise<{
    success: boolean;
    userAvatar: UserAvatar;
    remainingCoins: number;
  }> => {
    const res = await axios.post(`${API_BASE}/purchase/${avatarId}`, {});
    return res.data;
  },

  setCurrentAvatar: async (avatarId: number): Promise<{ success: boolean, avatarUrl: string }> => {
    const res = await axios.post(`${API_BASE}/set-current/${avatarId}`, {});
    return res.data;
  },
};
