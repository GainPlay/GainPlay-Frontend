import { create } from "zustand";

// Define the structure of the workout data
interface WorkoutData {
  workouts: {
    id: string;
    name: string;
    duration: number; // in minutes
    caloriesBurned: number;
    date: string;
  }[];
  addWorkout: (workout: Omit<WorkoutData["workouts"][0], "id">) => void;
  removeWorkout: (id: string) => void;
  setWorkouts: (workouts: WorkoutData["workouts"]) => void;
}

// Create the Zustand store for workout data
export const useWorkoutStore = create<WorkoutData>((set) => ({
  workouts: [],
  addWorkout: (workout) =>
    set((state) => ({
      workouts: [
        ...state.workouts,
        { ...workout, id: new Date().toISOString() }, // Generate a unique ID for each workout
      ],
    })),
  removeWorkout: (id) =>
    set((state) => ({
      workouts: state.workouts.filter((workout) => workout.id !== id),
    })),
  setWorkouts: (workouts) => set(() => ({ workouts })),
}));

// const { workouts, addWorkout, removeWorkout } = useWorkoutStore();
// setWorkouts(fetchedWorkouts);
