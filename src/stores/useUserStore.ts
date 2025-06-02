// userStore.ts
import { FrontendUserData } from "@/types";
import { create } from "zustand";

// Define the structure of the user data
interface UserData extends FrontendUserData {
  setUser: (user: Partial<FrontendUserData>) => void;
  logout: () => void;
}

// Create the Zustand store for user data
export const useUserStore = create<UserData>((set) => ({
  id: 0,
  name: "",
  email: "",
  isLoggedIn: false,
  finished_onboarding: false,
  setUser: (user: Partial<FrontendUserData>) => set(() => ({ ...user })),
  logout: () =>
    set(() => ({
      id: 0,
      name: "",
      email: "",
      password_hash: "",
      avatar_url: "",
      coins: 0,
      level: 0,
      experience: 0,
      created_at: null,
      finished_onboarding: false
    }))
}));
