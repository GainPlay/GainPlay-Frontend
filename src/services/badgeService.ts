import { Badge } from "@/types";
import axios from "axios";

const API_BASE = "/badges";

export const badgeService = {
  // Get all available badges
  getAllBadges: async (): Promise<Badge[]> => {
    const res = await axios.get(API_BASE);
    return res.data;
  },

  // Get user's earned badges
  getUserBadges: async (): Promise<Badge[]> => {
    const res = await axios.get(`${API_BASE}/user`);
    return res.data;
  },

  // Check and award new badges (call after workout completion)
  checkAndAwardBadges: async (): Promise<{
    success: boolean;
    newBadges: Badge[];
    message: string;
  }> => {
    const res = await axios.post(`${API_BASE}/check`);
    return res.data;
  },
};
