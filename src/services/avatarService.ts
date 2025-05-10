import { avatars } from "@/data/mockData";
import { FrontendAvatar } from "@/types";

export const avatarService = {
  getAvatars: async (): Promise<FrontendAvatar[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(avatars);
      }, 100);
    });
  },

  getOwnedAvatars: async (): Promise<string[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ownedAvatars = localStorage.getItem("ownedAvatars");
        resolve(ownedAvatars ? JSON.parse(ownedAvatars) : []);
      }, 100);
    });
  },

  buyAvatar: async (avatarId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const avatar = avatars.find((a) => a.id === avatarId);
        if (avatar && userData.coins >= avatar.price) {
          userData.coins -= avatar.price;
          const ownedAvatars = JSON.parse(
            localStorage.getItem("ownedAvatars") || "[]"
          );
          ownedAvatars.push(avatarId);
          localStorage.setItem("ownedAvatars", JSON.stringify(ownedAvatars));
          localStorage.setItem("userData", JSON.stringify(userData));
          resolve();
        } else {
          reject(new Error("Not enough coins or avatar not found"));
        }
      }, 100);
    });
  },

  setCurrentAvatar: async (avatarImage: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem("currentAvatar", avatarImage);
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        userData.avatar = avatarImage;
        localStorage.setItem("userData", JSON.stringify(userData));
        resolve();
      }, 100);
    });
  }
};
