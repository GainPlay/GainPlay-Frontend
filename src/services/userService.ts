import type { UserData, Friend, UserGoal } from "../types";
import { defaultUserData, friends } from "../data/mockData";
import apiClient from "./apiClient";

export const userService = {
  getUserData: async (): Promise<UserData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedUserData = localStorage.getItem("userData");
        resolve(storedUserData ? JSON.parse(storedUserData) : defaultUserData);
      }, 100);
    });
  },

  updateUserData: async (newData: Partial<UserData>): Promise<UserData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedUserData = localStorage.getItem("userData");
        const currentData = storedUserData ? JSON.parse(storedUserData) : defaultUserData;
        const updatedData = { ...currentData, ...newData };
        localStorage.setItem("userData", JSON.stringify(updatedData));
        resolve(updatedData);
      }, 100);
    });
  },

  getFriends: async (): Promise<Friend[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(friends);
      }, 100);
    });
  },

  addFriend: async (friendId: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const newFriend = friends.find((f) => f.id === friendId);
        if (newFriend) {
          userData.friends = [...(userData.friends || []), { ...newFriend, isFriend: true }];
          localStorage.setItem("userData", JSON.stringify(userData));
        }
        resolve();
      }, 100);
    });
  },
  saveUserGoals: async (userGoals: Partial<UserGoal>[]): Promise<void> => {
    try {
      apiClient.post("/user/userGoals", userGoals);
    } catch (error) {
      throw error;
    }
  },
};
