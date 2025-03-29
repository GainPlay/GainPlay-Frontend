export type Exercise = {
  exerciseId: number;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  restTimeSeconds: number;
  sets: Array<{ completed: boolean; reps: number }>;
  currentSet: number;
  currentReps: number;
};

export type WorkoutHistoryItem = {
  date: string;
  exercises: {
    name: string;
    sets: { completed: boolean; reps: number }[];
    totalReps: number;
  }[];
};

export type Avatar = {
  id: string;
  name: string;
  image: string;
  price: number;
};

export type Badge = {
  id: string;
  name: string;
  icon: string;
};

export type Friend = {
  id: number;
  name: string;
  avatar: string;
  email: string;
  goals: string[];
  level: number;
  isFriend: boolean;
  goalValues?: number[];
};

export type Goal = {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
};

export type UserGoal = {
  id: number;
  userId: number;
  goalId: number;
  name: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UserData = {
  name: string;
  email: string;
  avatar: string;
  coins: number;
  goals: {
    [key: string]: number;
  };
  badges: Badge[];
  friends: Friend[];
};

export type User = {
  username: string;
  email: string;
  password: string;
};

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
