import { onboardingQuestions } from "../data/mockData";

export const questionsService = {
  getQuestions: async (): Promise<string[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedQuestionsData = localStorage.getItem("questions");
        resolve(
          storedQuestionsData
            ? JSON.parse(storedQuestionsData)
            : onboardingQuestions
        );
      }, 100);
    });
  },
};
