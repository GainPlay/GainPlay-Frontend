import { Avatar } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AvatarStore {
  allAvatars: Avatar[];
  selectedAvatar: Avatar | null;
  loading: boolean;
  error: string | null;
  initializeAvatars: () => Promise<void>;
  selectAvatar: (avatarId: number) => void;
  setSelectedAvatar: (avatar: Avatar) => void;
}

export const useAvatarStore = create<AvatarStore>()(
  devtools((set, get) => ({
    allAvatars: [],
    selectedAvatar: null,
    loading: false,
    error: null,

    initializeAvatars: async () => {
      set({ loading: true, error: null });
      try {
        const response = await fetch("/avatars");
        if (!response.ok) {
          throw new Error("Failed to fetch avatars");
        }
        const data: Avatar[] = await response.json();
        set({ allAvatars: data, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },

    selectAvatar: (avatarId) => {
      const avatar = get().allAvatars.find((a) => a.id === avatarId) || null;
      set({ selectedAvatar: avatar });
    },

    setSelectedAvatar: (avatar) => {
      set({ selectedAvatar: avatar });
    },
  }))
);
