import type { WorkoutHistoryItem, Exercise, Goal } from "../types";
import { initialExercises, onboardingQuestions } from "../data/mockData";

export const workoutService = {
  getWorkoutHistory: async (): Promise<WorkoutHistoryItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedHistory = localStorage.getItem("workoutHistory");
        resolve(storedHistory ? JSON.parse(storedHistory) : []);
      }, 100);
    });
  },

  getCurrentWorkout: async (): Promise<Exercise[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedWorkout = localStorage.getItem("currentWorkout");
        resolve(storedWorkout ? JSON.parse(storedWorkout) : initialExercises);
      }, 100);
    });
  },

  saveCurrentWorkout: async (workout: Exercise[]): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem("currentWorkout", JSON.stringify(workout));
        resolve();
      }, 100);
    });
  },

  finishWorkout: async (workout: Exercise[]): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const completedWorkout = {
          date: new Date().toISOString(),
          exercises: workout.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets,
            totalReps: exercise.sets.reduce((total, set) => total + set.reps, 0),
          })),
        };

        const workoutHistory = JSON.parse(localStorage.getItem("workoutHistory") || "[]");
        workoutHistory.push(completedWorkout);
        localStorage.setItem("workoutHistory", JSON.stringify(workoutHistory));

        localStorage.removeItem("currentWorkout");
        localStorage.removeItem("workoutStarted");
        localStorage.removeItem("activeExerciseIndex");

        const earnedCoins = 50;
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        userData.coins = (userData.coins || 0) + earnedCoins;
        localStorage.setItem("userData", JSON.stringify(userData));

        resolve(earnedCoins);
      }, 100);
    });
  },
  getGoals: async (): Promise<Goal[]> => {
    return onboardingQuestions;
  },
};
