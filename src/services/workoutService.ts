import { Workout } from "@/types";
import axios from "axios";

export const workoutService = {
  generateWorkout: async (): Promise<Workout> => {
    try {
      return (await axios.post("/workout/generate")).data;
    } catch (error) {
      console.error("Error generating workout:", error);
      throw error;
    }
  },

  getCurrentWorkout: async (): Promise<Workout> => {
    try {
      return (await axios.get("/workout/current")).data;
    } catch (error) {
      console.error("Error getting current workout:", error);
      throw error;
    }
  },

  finishWorkout: async (finishedWorkout: any): Promise<{ coins: number; experience_earned: number; score: number }> => {
    try {
      return (await axios.put(`/workout/finishWorkout`, finishedWorkout)).data;
    } catch (error) {
      console.error("Error finishing workout:", error);
      throw error;
    }
  },
};
