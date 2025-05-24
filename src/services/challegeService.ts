import { User } from "@/types";
import axios from "axios";

export type Challenge = {
  id: number;
  description: string;
  exercise: string;
  repetitions: number;
  intervals: number;
};

export const challengeService = {
  generateChallenge: async (): Promise<Challenge> => {
    try {
      return (await axios.post("/daily-challenge")).data;
    } catch (error) {
      console.error("Error generating daily challenge:", error);
      throw error;
    }
  },

  finishChallenge: async (userId: number): Promise<{ user: User }> => {
    try {
      return (await axios.post(`/daily-challenge/complete/${userId}`)).data;
    } catch (error) {
      console.error("Error finishing daily challenge:", error);
      throw error;
    }
  },
};
