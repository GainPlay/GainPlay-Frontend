// import type { UserData, Friend, UserGoal, Exercise } from "../types";
// import { defaultUserData, friends } from "../data/mockData";
// import apiClient from "./apiClient";

import { Friendship, FrontendUserData } from "@/types";
import apiClient from "./apiClient";

export const friendsService = {
  getFriends: async (userId: number): Promise<Friendship[]> => {
    return (
      await apiClient.get("/friendships", {
        params: { userId: userId },
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJuYWRhdmF6YUBnbWFpbC5jb20iLCJpYXQiOjE3NDcyNDIxOTMsImV4cCI6MTc0NzI0NTc5M30.I0RGO7UtM58Xs3tNhwqYckffeC6LlKiUhKnQfG9Bx6Y`,
        },
      })
    ).data;
  },
  getDiscover: async (userId: number): Promise<FrontendUserData[]> => {
    return (
      await apiClient.get("/friendships/discover", {
        params: { userId: userId },
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJuYWRhdmF6YUBnbWFpbC5jb20iLCJpYXQiOjE3NDcyNDIxOTMsImV4cCI6MTc0NzI0NTc5M30.I0RGO7UtM58Xs3tNhwqYckffeC6LlKiUhKnQfG9Bx6Y`,
        },
      })
    ).data;
  },
};
