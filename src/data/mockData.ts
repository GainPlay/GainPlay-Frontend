import type { Exercise, Avatar, Badge, Friend, UserData, Goal } from "../types";

export const avatars: Avatar[] = [
  { id: "1", name: "Sporty Spice", image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Sporty", price: 100 },
  { id: "2", name: "Zen Master", image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Zen", price: 150 },
  { id: "3", name: "Power Lifter", image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Power", price: 200 },
  { id: "4", name: "Yoga Guru", image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Yoga", price: 250 },
  { id: "5", name: "Runner", image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Runner", price: 300 },
  { id: "6", name: "Swimmer", image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Swimmer", price: 350 },
  { id: "7", name: "Cyclist", image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Cyclist", price: 400 },
  { id: "8", name: "Boxer", image: "https://api.dicebear.com/6.x/avataaars/svg?seed=Boxer", price: 450 },
];

export const badges: Badge[] = [
  { id: "1", name: "Early Bird", icon: "🌅" },
  { id: "2", name: "Night Owl", icon: "🦉" },
  { id: "3", name: "Consistency King", icon: "👑" },
  { id: "4", name: "Muscle Master", icon: "💪" },
  { id: "5", name: "Cardio Crusher", icon: "🏃" },
];

export const friends: Friend[] = [
  {
    id: 1,
    name: "Alice Johnson",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Alice",
    email: "alice@example.com",
    goals: ["Gain Muscle", "Improve Flexibility"],
    goalValues: [7, 8],
    level: 5,
    isFriend: true,
  },
  {
    id: 2,
    name: "Bob Smith",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Bob",
    email: "bob@example.com",
    goals: ["Lose Weight", "Increase Stamina"],
    goalValues: [6, 9],
    level: 3,
    isFriend: true,
  },
  {
    id: 3,
    name: "Charlie Brown",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Charlie",
    email: "charlie@example.com",
    goals: ["Improve Flexibility", "Increase Stamina"],
    goalValues: [5, 7],
    level: 4,
    isFriend: false,
  },
  {
    id: 4,
    name: "Diana Prince",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Diana",
    email: "diana@example.com",
    goals: ["Gain Muscle", "Lose Weight"],
    goalValues: [8, 6],
    level: 6,
    isFriend: false,
  },
  {
    id: 5,
    name: "Ethan Hunt",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Ethan",
    email: "ethan@example.com",
    goals: ["Increase Stamina", "Improve Flexibility"],
    goalValues: [9, 7],
    level: 7,
    isFriend: false,
  },
  {
    id: 6,
    name: "Fiona Gallagher",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Fiona",
    email: "fiona@example.com",
    goals: ["Lose Weight", "Gain Muscle"],
    goalValues: [6, 8],
    level: 5,
    isFriend: false,
  },
  {
    id: 7,
    name: "George Costanza",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=George",
    email: "george@example.com",
    goals: ["Improve Flexibility", "Increase Stamina"],
    goalValues: [4, 5],
    level: 2,
    isFriend: false,
  },
  {
    id: 8,
    name: "Hannah Baker",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Hannah",
    email: "hannah@example.com",
    goals: ["Gain Muscle", "Increase Stamina"],
    goalValues: [7, 8],
    level: 6,
    isFriend: false,
  },
];

export const initialExercises: Exercise[] = [
  {
    name: "Push-ups",
    targetSets: 3,
    targetReps: 10,
    sets: Array(3).fill({ completed: false, reps: 0 }),
    currentSet: 0,
    currentReps: 0,
  },
  {
    name: "Squats",
    targetSets: 3,
    targetReps: 15,
    sets: Array(3).fill({ completed: false, reps: 0 }),
    currentSet: 0,
    currentReps: 0,
  },
  {
    name: "Plank",
    targetSets: 3,
    targetReps: 30,
    sets: Array(3).fill({ completed: false, reps: 0 }),
    currentSet: 0,
    currentReps: 0,
  },
];

export const defaultUserData: UserData = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=default",
  coins: 500,
  goals: {
    "Gain Muscle": 7,
    "Improve Flexibility": 5,
    "Increase Stamina": 8,
  },
  badges: badges.slice(0, 3),
  friends: [friends[0], friends[1]],
};
