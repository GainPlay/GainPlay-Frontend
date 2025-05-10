import { badges } from "@/data/mockData";
import { Badge } from "@/types";

export const badgeService = {
  getBadge: async (): Promise<Badge[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedBadgeData = localStorage.getItem("badges");
        resolve(storedBadgeData ? JSON.parse(storedBadgeData) : badges);
      }, 100);
    });
  }
};
