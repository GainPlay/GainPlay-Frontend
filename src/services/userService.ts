import { FrontendUserData } from "@/types";
import axios from "axios";

export const userService = {
  getUserData: async (userId: number): Promise<FrontendUserData> => {
    return (await axios.get(`/users/${userId}`)).data;
  }
};
