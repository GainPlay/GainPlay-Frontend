import { initialExercises } from "@/data/mockData";
import { FrontendExercise, Goal, WorkoutHistoryItem } from "@/types";
import axios from "axios";

export const workoutService = {
  getWorkoutHistory: async (): Promise<WorkoutHistoryItem[]> => {
        return (await axios.get(`/workout`)).data;
  },

};
