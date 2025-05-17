// userStore.ts
import { create } from "zustand";

// Define the structure of the user data
interface UserData {
  id: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
  setUser: (user: UserData) => void;
  logout: () => void;
}

// Create the Zustand store for user data
export const useUserStore = create<UserData>((set) => ({
  id: "",
  name: "",
  email: "",
  isLoggedIn: false,
  setUser: (user) => set(() => ({ ...user, isLoggedIn: true })),
  logout: () => set(() => ({ id: "", name: "", email: "", isLoggedIn: false })),
}));

// const { name, email, isLoggedIn, setUser, logout } = useUserStore();
