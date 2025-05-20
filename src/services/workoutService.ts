import { Workout } from "@/types";
import axios from "axios";
import { getTokens } from "./authService";

export const workoutService = {
  generateWorkout: async (): Promise<Workout> => {
    try {
      const access_token = getTokens().accessToken;
      const response = await axios.post(
        "/workout/generate",
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating workout:", error);
      throw error;
    }
  },

  getCurrentWorkout: async (): Promise<Workout> => {
    try {
      const access_token = getTokens().accessToken;

      const response = await axios.get("/workout/currentWorkout", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error getting current workout:", error);
      throw error;
    }
  },
};
