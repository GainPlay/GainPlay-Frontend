import { Badge } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface BadgeStore {
  allBadges: Badge[];
  userBadges: Badge[];
  loading: boolean;
  error: string | null;
  initializeBadges: () => Promise<void>;
  addUserBadge: (badge: Badge) => void;
  removeUserBadge: (badgeId: number) => void;
  setUserBadges: (badges: Badge[]) => void;
}

export const useBadgeStore = create<BadgeStore>()(
  devtools((set, get) => ({
    allBadges: [],
    userBadges: [],
    loading: false,
    error: null,

    initializeBadges: async () => {
      set({ loading: true, error: null });
      try {
        const response = await fetch("/api/badges");
        if (!response.ok) {
          throw new Error("Failed to fetch badges");
        }
        const data: Badge[] = await response.json();
        set({ allBadges: data, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },

    addUserBadge: (badge) => {
      const { userBadges } = get();
      if (!userBadges.find((b) => b.id === badge.id)) {
        set({ userBadges: [...userBadges, badge] });
      }
    },

    removeUserBadge: (badgeId) => {
      set((state) => ({
        userBadges: state.userBadges.filter((b) => b.id !== badgeId),
      }));
    },

    setUserBadges: (badges) => {
      set({ userBadges: badges });
    },
  }))
);
