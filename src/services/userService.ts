import { FrontendUserData } from "@/types";
import apiClient from "./apiClient";

export const userService = {
  getUserData: async (userId: Number): Promise<FrontendUserData> => {
    return (await apiClient.get(`/users/${userId}`)).data;
  },
};
