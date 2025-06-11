// User related types
export interface User {
  id: number;
  name: string | null;
  email: string | null;
  password_hash?: string | null;
  avatar_url?: string | null;
  coins?: number;
  level?: number;
  experience?: number;
  created_at?: Date | null;
}

export interface UserSettings {
  id: number;
  user_id: number;
  exercise_frequency: number;
  fitness_level: number;
  workout_duration: number;
  weight: number;
  height: number;
  age: number;
  body_structure: string;
  created_at: string;
  updated_at: string;
}

// Avatar related types
export interface Avatar {
  id: number;
  name: string | null;
  image_url: string | null;
  price: number | null;
  created_at: Date | null;
  category?: string; // Added to match frontend
  rarity?: "common" | "rare" | "epic" | "legendary"; // Added to match frontend
}

// types.ts - Add this to your types file

export interface FrontendAvatar {
  id: number;
  name: string;
  image_url: string;
  price: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  created_at: string;
}

// Type for the user avatars response from the API
export interface UserAvatar {
  id: number;
  user_id: number;
  avatar_id: number;
  is_current: boolean;
  purchased_at: string;
  avatars: FrontendAvatar;
}
export interface UserBadge {
  id: number;
  user_id: number | null;
  badge_id: number | null;
  earned_at: Date | null;
}

// Goal related types
export interface Goal {
  id: number;
  name: string | null;
  description: string | null;
  created_at: Date | null;
}

export interface UserGoal {
  id: number;
  user_id: number | null;
  goal_id: number | null;
  value: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  goals: Goal;
}

// Friendship related types
export interface Friendship {
  id: number;
  user_id: number | null;
  friend_id: number | null;
  status: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  sender: Partial<FrontendUserData> | null;
  receiver: Partial<FrontendUserData> | null;
}

export interface Workout {
  id: number;
  user_id?: number;
  started_at?: string; // ISO string
  completed_at?: string;
  coins_earned?: number;
  experience_earned?: number;
  score: number;
  workout_exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: number;
  workout_id?: number;
  exercise_id?: number;
  template_id?: number;
  exercise_sets: ExerciseSet[];
  exercises?: Exercise;
  exercise_templates?: ExerciseTemplate;
}

export interface ExerciseSet {
  id: number;
  workout_exercise_id?: number;
  set_number?: number;
  reps?: number;
  completed_reps?: number;
}

export interface ExerciseTemplate {
  id: number;
  exercise_id?: number;
  target_sets?: number;
  target_reps?: number;
  rest_time_seconds?: number;
  created_at?: string;
  exercises?: Exercise;
}

export interface Exercise {
  id: number;
  name?: string;
  description?: string;
  category?: string;
  difficulty_level?: number;
  muscle_group?: string;
}

export interface WorkoutHistoryItem {
  date: string;
  exercises: {
    name: string;
    sets: { completed: boolean; completedReps: number; reps: number }[];
    totalReps: number;
    xpEarned?: number;
  }[];
}

export type ExerciseDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export enum DifficultyLevel {
  BEGINNER = 1,
  INTERMEDIATE,
  ADVANCED,
  EXPERT
}

export const difficultyMap: Record<DifficultyLevel, ExerciseDifficulty> = {
  [DifficultyLevel.BEGINNER]: "beginner",
  [DifficultyLevel.INTERMEDIATE]: "intermediate",
  [DifficultyLevel.ADVANCED]: "advanced",
  [DifficultyLevel.EXPERT]: "expert"
};

// Add a frontend-specific type for the workout UI
export interface WorkoutUIExercise {
  id: number;
  name: string;
  targetSets: number;
  targetReps: number;
  restTime: number;
  instruction: string;
  difficulty: ExerciseDifficulty;
  muscleGroup: string;
  sets: Array<{ id?: number; completed: boolean; reps: number }>;
  currentSet: number;
  currentReps: number;
  tips: string[];
  exerciseId: number;
  workoutExerciseId: number;
  templateId: number;
}

export interface FrontendBadge {
  id: number;
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
}

export interface FrontendAvatar {
  id: number;
  name: string;
  image: string;
  price: number;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export enum FriendshipStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  BLOCKED = "blocked",
  NONE = "none"
}
export interface FrontendUserData {
  id: number;
  email: string;
  name?: string;
  avatar_url?: string;
  coins?: number;
  height?: number;
  weight?: number;
  streak?: number;
  age?: number;
  experience?: number;
  finished_onboarding: boolean;
  level?: number;
  status?: FriendshipStatus;
  user_settings?: UserSettings;
  user_badges?: FrontendBadge[];
  user_goals?: UserGoal[];
}

type GeneralResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export type SigninResponse = {
  user: User;
  access_token: string;
  refresh_token?: string;
  error?: string;
};

export type GoogleSignInResponse = GeneralResponse;

export type SignupResponse = {
  access_token: string;
  error?: string;
};

export type OnboardingData = {
  fitnessLevel: number;
  fitnessGoals: Record<number, number>;
  workoutFrequency: number;
  workoutDuration: number;
  bodyStructure: string;
  technicalData: {
    age: number;
    weight: number;
    height: number;
  };
};

export type OnboardingResponse = {
  userGoals: UserGoal[];
  userSettings: UserSettings;
};

export interface FrontendSurveyValues {
  fitnessLevel: string;
  fitnessGoals: Record<string, number>;
  workoutFrequency: string;
  workoutDuration: string;
  bodyStructure: string;
  technicalData: {
    age: string;
    weight: string;
    height: string;
  };
}

export interface ApiSurveyValues {
  fitnessLevel: number;
  fitnessGoals: Record<string, number>;
  workoutFrequency: number;
  workoutDuration: number;
  bodyStructure: string;
  technicalData: {
    age: number;
    weight: number;
    height: number;
  };
}

export interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
}

// export interface UserBadge extends Badge {
//   earnedAt: string;
// }

export type HealthInsight = {
  type: string;
  icon: string;
  title: string;
  description: string;
  color: string;
};

export type HealthInsightResponse = {
  insights: HealthInsight[];
};
