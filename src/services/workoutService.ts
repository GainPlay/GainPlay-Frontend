import { initialExercises } from "@/data/mockData";
import { FrontendExercise, Goal, WorkoutHistoryItem } from "@/types";
import axios from "axios";

export const workoutService = {
  getWorkoutHistory: async (userId: number): Promise<WorkoutHistoryItem[]> => {
        return (await axios.get(`/users/${userId}`)).data;
    
  },

};
