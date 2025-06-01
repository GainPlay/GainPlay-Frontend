import { User } from "@/types";
import axios from "axios";

export type Challenge = {
  id: number;
  description: string;
  exercise: string;
  repetitions: number;
  intervals: number;
};
const API_BASE = "/daily-challenge";

export const challengeService = {
  generateChallenge: async (): Promise<Challenge> => {
    try {
      return (await axios.get(`${API_BASE}`)).data;
    } catch (error) {
      console.error("Error generating daily challenge:", error);
      throw error;
    }
  },

  finishChallenge: async (userId: number): Promise<{ user: User }> => {
    try {
      return (await axios.post(`${API_BASE}/complete/${userId}`)).data;
    } catch (error) {
      console.error("Error finishing daily challenge:", error);
      throw error;
    }
  },
};
