import { FrontendUserData } from "@/types";
import axios from "axios";

export const userService = {
  getUserData: async (userId: number): Promise<FrontendUserData> => {
    return (await axios.get(`/users/${userId}`)).data;
  },

  updateUserSettings: async (
    userId: number,
    settings: Partial<FrontendUserData>
  ): Promise<FrontendUserData> => {
    return (await axios.patch(`/user-settings/user/${userId}`, settings)).data;
  }
};
