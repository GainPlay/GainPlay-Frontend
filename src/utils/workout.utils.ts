import { Workout } from "@/types";

export const XP_CONST = 50;

// Update a set's completed reps
export const updateSetUtils = (
  currentWorkout: Workout,
  workoutExerciseId: number,
  setId: number,
  completedReps: number
): Workout => {
  // Create a deep copy of the workout to avoid modifying the original
  const updatedWorkout = JSON.parse(JSON.stringify(currentWorkout)) as Workout;

  // Find the workout exercise
  const workoutExerciseIndex = updatedWorkout.workout_exercises.findIndex((we) => we.id === workoutExerciseId);
  if (workoutExerciseIndex === -1) {
    throw new Error("Workout exercise not found");
  }

  // Find the set
  const setIndex = updatedWorkout.workout_exercises[workoutExerciseIndex].exercise_sets.findIndex(
    (s) => s.id === setId
  );
  if (setIndex === -1) {
    throw new Error("Set not found");
  }

  // Update the set
  updatedWorkout.workout_exercises[workoutExerciseIndex].exercise_sets[setIndex].completed_reps = completedReps;

  return updatedWorkout;
};
