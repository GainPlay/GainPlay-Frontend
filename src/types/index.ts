// User related types
export interface User {
  id: number;
  name: string | null;
  email: string | null;
  password_hash?: string | null;
  avatar_url: string | null;
  coins: number;
  level: number;
  experience: number;
  created_at: Date | null;
}

export interface UserSettings {
  id: number;
  user_id: number | null;
  exercise_frequency: number | null;
  fitness_level: number | null;
  created_at: Date | null;
  updated_at: Date | null;
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

export interface UserAvatar {
  id: number;
  user_id: number | null;
  avatar_id: number | null;
  is_current: boolean | null;
  purchased_at: Date | null;
}

// Badge related types
export interface Badge {
  id: number;
  name: string | null;
  icon: string | null;
  description: string | null; // This was already in your schema
  created_at: Date | null;
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
}

// Friendship related types
export interface Friendship {
  id: number;
  user_id: number | null;
  friend_id: number | null;
  status: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// Exercise related types
export interface Exercise {
  id: number;
  name: string | null;
  description: string | null;
  category: string | null;
  difficulty_level: number | null;
  muscle_group: string | null;
}

export interface ExerciseTemplate {
  id: number;
  exercise_id: number | null;
  target_sets: number | null;
  target_reps: number | null;
  rest_time_seconds: number | null;
  created_at: Date | null;
}

export interface ExerciseSet {
  id: number;
  workout_exercise_id: number | null;
  set_number: number | null;
  reps: number | null;
  completed: boolean | null;
  completed_at: Date | null;
}

// Workout related types
export interface Workout {
  id: number;
  user_id: number | null;
  started_at: Date | null;
  completed_at: Date | null;
  coins_earned: number | null;
}

export interface WorkoutExercise {
  id: number;
  workout_id: number | null;
  exercise_id: number | null;
  template_id: number | null;
  total_reps: number | null;
}

// Frontend specific types
export interface FrontendExercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  restTime: number;
  instruction: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  muscleGroup: string;
  xpReward: number;
  sets: Array<{ completed: boolean; reps: number }>;
  currentSet: number;
  currentReps: number;
  tips: string[];
}

export interface FrontendBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedOn?: string;
}

export interface FrontendAvatar {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export enum FriendshipStatus {
  FRIEND = "friend",
  PENDING_SENT = "pending-sent",
  PENDING_RECEIVED = "pending-received",
  NONE = "none"
}

export interface FrontendFriend {
  id: number;
  name: string;
  avatar: string;
  email: string;
  goals: string[];
  level: number;
  status?: FriendshipStatus;
}

export interface FrontendUserData {
  name: string;
  email: string;
  avatar: string;
  coins: number;
  height: string;
  weight: string;
  age: string;
  badges: FrontendBadge[];
}

export interface WorkoutHistoryItem {
  date: string;
  exercises: {
    name: string;
    sets: { completed: boolean; reps: number }[];
    totalReps: number;
    xpEarned?: number;
  }[];
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

export type SigninResponse = GeneralResponse;

export type GoogleSignInResponse = GeneralResponse;

export type SignupResponse = User;
