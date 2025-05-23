import { FrontendAvatar, UserAvatar } from "@/types";
import axios from "axios";
import { getTokens } from "./authService";

const API_BASE = "/avatars";

export const avatarService = {
  getAvatars: async (): Promise<FrontendAvatar[]> => {
    const accessToken = getTokens().accessToken;
    const res = await axios.get(API_BASE, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  },

  getOwnedAvatars: async (): Promise<UserAvatar[]> => {
    const accessToken = getTokens().accessToken;
    const res = await axios.get(`${API_BASE}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  },

  purchaseAvatar: async (
    avatarId: number
  ): Promise<{
    success: boolean;
    userAvatar: UserAvatar;
    remainingCoins: number;
  }> => {
    const accessToken = getTokens().accessToken;
    const res = await axios.post(
      `${API_BASE}/purchase/${avatarId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return res.data;
  },

  setCurrentAvatar: async (avatarId: number): Promise<{ success: boolean }> => {
    const accessToken = getTokens().accessToken;
    const res = await axios.post(
      `${API_BASE}/set-current/${avatarId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return res.data;
  },
};
