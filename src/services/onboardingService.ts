import apiClient from "./apiClient";
import { OnboardingData, OnboardingResponse } from "@/types/index";
import { getTokens } from "@/services/authService";
export const onboardingService = {
  saveOnboardingData: async (
    onboardingData: OnboardingData
  ): Promise<OnboardingResponse> => {
    try {
      const access_token = getTokens().accessToken;
    return await apiClient.post(
      "/users/onboarding",
      onboardingData,
      {
        headers: {
        Authorization: `Bearer ${access_token}`,
        },
      }
    );
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      throw error;
    }
  },
};
