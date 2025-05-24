import { OnboardingData, OnboardingResponse } from "@/types/index";
import axios from "axios";

export const onboardingService = {
  saveOnboardingData: async (
    onboardingData: OnboardingData
  ): Promise<OnboardingResponse> => {
    try {
      return await axios.post("/users/onboarding", onboardingData);
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      throw error;
    }
  }
};
