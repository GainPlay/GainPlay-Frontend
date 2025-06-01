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
        const response = await fetch("/api/avatars");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch avatars: ${response.status} ${response.statusText}`
          );
        }

        const contentType = response.headers.get("content-type") || "";

        // Check if response is JSON
        if (!contentType.includes("application/json")) {
          const rawText = await response.text();
          console.error("Unexpected response format:", rawText);
          throw new Error("Expected JSON but received non-JSON response");
        }

        const data: Avatar[] = await response.json();
        console.log("Fetched avatars:", data);

        set({ allAvatars: data, loading: false });
      } catch (err: any) {
        console.error("Error fetching avatars:", err);
        set({ error: err.message || "Unknown error", loading: false });
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
