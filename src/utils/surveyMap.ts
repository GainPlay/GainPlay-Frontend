import { ApiSurveyValues, FrontendSurveyValues } from "@/types/index";

export const mapSurveyValuesToApi = (
  values: FrontendSurveyValues
): ApiSurveyValues => {
  // Map fitness level to number
  const fitnessLevelMap: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4
  };

  // Map fitness goals to goal IDs
  const fitnessGoalsMap: Record<string, number> = {
    loseWeight: 1,
    gainMuscle: 2,
    improveEndurance: 3,
    increaseStrength: 4,
    improveFlexibility: 5,
    maintainHealth: 6
  };

  // Map workout frequency to number
  const workoutFrequencyMap: Record<string, number> = {
    "1-2": 2,
    "3-4": 4,
    "5-6": 6,
    daily: 7
  };

  // Map workout duration to minutes
  const workoutDurationMap: Record<string, number> = {
    "15min": 15,
    "30min": 30,
    "45min": 45,
    "60min": 60,
    "90min": 90
  };

  // Transform fitness goals from keys to IDs
  const mappedGoals: Record<string, number> = {};
  Object.entries(values.fitnessGoals).forEach(([key, value]) => {
    const goalId = fitnessGoalsMap[key];
    if (goalId) {
      mappedGoals[goalId] = value;
    }
  });

  return {
    fitnessLevel: fitnessLevelMap[values.fitnessLevel] || 1,
    fitnessGoals: mappedGoals,
    workoutFrequency: workoutFrequencyMap[values.workoutFrequency] || 3,
    workoutDuration: workoutDurationMap[values.workoutDuration] || 30,
    bodyStructure: values.bodyStructure,
    technicalData: {
      age: parseInt(values.technicalData.age) || 0,
      weight: parseInt(values.technicalData.weight) || 0,
      height: parseInt(values.technicalData.height) || 0
    }
  };
};
