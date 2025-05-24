import { FrontendUserData } from "@/types";
import axios from "axios";

export const userService = {
  getUserData: async (userId: number): Promise<FrontendUserData> => {
    return (await axios.get(`/users/${userId}`)).data;
  },
  getUserDataByMail: async (email: string): Promise<FrontendUserData> => {
    return (await axios.get(`/users/${email}/mail`)).data;
  },
  updateUser: async (
    userId: number,
    userData: unknown
  ): Promise<FrontendUserData> => {
    return (await axios.post(`/users/${userId}/updateUser`, { userData })).data;
  },

  updateUserSettings: async (
    userId: number,
    settings: Partial<FrontendUserData>
  ): Promise<FrontendUserData> => {
    return (await axios.patch(`/user-settings/user/${userId}`, settings)).data;
  },
};
