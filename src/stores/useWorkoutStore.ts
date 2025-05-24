import { Workout } from "@/types";
import { create } from "zustand";

interface WorkoutStore {
  currentWorkout: Workout | null;
  workoutHistory: Workout[];
  setCurrentWorkout: (workout: Workout | null) => void;
  setWorkoutHistory: (workouts: Workout[]) => void;
}

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  currentWorkout: null,
  workoutHistory: [],

  setCurrentWorkout: (workout) => set(() => ({ currentWorkout: workout })),
  setWorkoutHistory: (workouts) => set(() => ({ workoutHistory: workouts })),
}));
