import { FrontendUserData } from "@/types";
import axios from "axios";
import apiClient from "./apiClient";

export const userService = {
  getUserData: async (userId: number): Promise<FrontendUserData> => {
    return (await axios.get(`/users/${userId}`)).data;
  },
  getUserDataByMail: async (email: string): Promise<FrontendUserData> => {
    return (await apiClient.get(`/users/${email}/mail`)).data;
  },
  updateUser: async (userId: number, userData:any): Promise<FrontendUserData> => {
    return (await apiClient.post(`/users/${userId}/updateUser`, {userData})).data;
  },
};
