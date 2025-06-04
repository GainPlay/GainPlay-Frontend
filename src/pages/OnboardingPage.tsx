import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, ArrowLeft, Dumbbell } from "lucide-react";
import { mapSurveyValuesToApi } from "@/utils/surveyMap";
import { onboardingService } from "@/services/onboardingService";
import { toast } from "@/hooks/use-toast";
import { workoutService } from "@/services/workoutService";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useUserStore } from "@/stores/useUserStore";
import { userService } from "@/services/userService";
import { cn } from "@/lib/utils";

// Type definitions
type Option = {
  value: string;
  label: string;
  description: string;
  image?: string;
};

type Field = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
};

type GoalOption = {
  id: string;
  label: string;
};

interface BaseQuestion {
  id: keyof Answers;
  question: string;
  description: string;
  icon: string;
}

interface RadioQuestion extends BaseQuestion {
  type: "radio";
  options: Option[];
}

interface MultiGoalQuestion extends BaseQuestion {
  type: "multiGoal";
  options: GoalOption[];
}

interface BodyTypeQuestion extends BaseQuestion {
  question: string;
  description: string;
  type: "bodyType";
  icon: string;
}

interface TechnicalDataQuestion extends BaseQuestion {
  type: "technicalData";
  fields: Field[];
}

type Question =
  | RadioQuestion
  | MultiGoalQuestion
  | BodyTypeQuestion
  | TechnicalDataQuestion;
  
  type TechnicalData = {
  age: string;
  weight: string;
  height: string;
};

type Answers = {
  fitnessLevel: string;
  fitnessGoals: Record<string, number>;
  workoutFrequency: string;
  workoutDuration: string;
  bodyStructure: string;
  technicalData: TechnicalData;
};

const bodyTypeOptions = [
  {
    value: "slim",
    title: "Ectomorph",
    subtitle: "Naturally Lean Build",
    description:
    "You tend to be naturally thin with a fast metabolism. You may find it challenging to gain weight or build muscle mass, even when eating more.",
    characteristics: [
      "Fast metabolism",
      "Hard to gain weight",
      "Lean build",
      "Small frame"
    ],
    bgColor: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    selectedBg: "from-blue-100 to-cyan-100",
    selectedBorder: "border-blue-400"
  },
  {
    value: "athletic",
    title: "Mesomorph",
    subtitle: "Naturally Athletic Build",
    description:
    "You have a naturally muscular and well-proportioned body. You respond well to exercise and can gain or lose weight relatively easily.",
    characteristics: [
      "Builds muscle easily",
      "Athletic look",
      "Balanced metabolism",
      "Defined muscles"
    ],
    bgColor: "from-green-50 to-emerald-50",
    borderColor: "border-green-200",
    selectedBg: "from-green-100 to-emerald-100",
    selectedBorder: "border-green-400"
  },
  {
    value: "solid",
    title: "Endomorph",
    subtitle: "Naturally Solid Build",
    description:
      "You tend to have a larger frame and may gain weight more easily. You can build muscle effectively but may need to work harder to lose fat.",
    characteristics: [
      "Gains muscle easily",
      "Slower metabolism",
      "Larger frame",
      "Stores fat easily"
    ],
    bgColor: "from-orange-50 to-amber-50",
    borderColor: "border-orange-200",
    selectedBg: "from-orange-100 to-amber-100",
    selectedBorder: "border-orange-400"
  }
];

const questions: Question[] = [
  {
    id: "technicalData",
    question: "Tell us a bit more about yourself",
    description: "This helps us personalize your experience",
    type: "technicalData",
    fields: [
      {
        id: "age",
        label: "Age",
        type: "number",
        placeholder: "Enter your age"
      },
      {
        id: "weight",
        label: "Weight (kg)",
        type: "number",
        placeholder: "Enter your weight in kg"
      },
      {
        id: "height",
        label: "Height (cm)",
        type: "number",
        placeholder: "Enter your height in cm"
      }
    ],
    icon: "📋"
  },
  {
    id: "fitnessLevel",
    question: "What's your current fitness level?",
    description: "Be honest about where you are today",
    type: "radio",
    options: [
      {
        value: "beginner",
        label: "Beginner",
        description: "New to fitness or returning after a long break"
      },
      {
        value: "intermediate",
        label: "Intermediate",
        description: "Exercise regularly with some experience"
      },
      {
        value: "advanced",
        label: "Advanced",
        description: "Consistent training with good knowledge"
      },
      {
        value: "expert",
        label: "Expert",
        description: "Highly trained with extensive experience"
      }
    ],
    icon: "📊"
  },
  {
    id: "fitnessGoals",
    question: "What are your fitness goals?",
    description: "Select all that apply and rate their importance to you",
    type: "multiGoal",
    options: [
      { id: "loseWeight", label: "Lose Weight" },
      { id: "gainMuscle", label: "Gain Muscle" },
      { id: "improveEndurance", label: "Improve Endurance" },
      { id: "increaseStrength", label: "Increase Strength" },
      { id: "improveFlexibility", label: "Improve Flexibility" },
      { id: "maintainHealth", label: "Maintain Health" }
    ],
    icon: "🎯"
  },
  {
    id: "workoutFrequency",
    question: "How often can you commit to working out?",
    description: "Select your realistic weekly workout frequency",
    type: "radio",
    options: [
      {
        value: "1-2",
        label: "1-2 times per week",
        description: "Getting started"
      },
      {
        value: "3-4",
        label: "3-4 times per week",
        description: "Consistent routine"
      },
      {
        value: "5-6",
        label: "5-6 times per week",
        description: "Dedicated schedule"
      },
      { value: "daily", label: "Daily", description: "Full commitment" }
    ],
    icon: "📅"
  },
  {
    id: "workoutDuration",
    question: "How long can you workout each session?",
    description: "Be realistic about your available time",
    type: "radio",
    options: [
      { value: "15min", label: "15 minutes", description: "Quick sessions" },
      { value: "30min", label: "30 minutes", description: "Standard sessions" },
      { value: "45min", label: "45 minutes", description: "Extended sessions" },
      { value: "60min", label: "60 minutes", description: "Full sessions" },
      {
        value: "90min",
        label: "90+ minutes",
        description: "Extended training"
      }
    ],
    icon: "⏱️"
  },
  {
    id: "bodyStructure",
    question: "Which body type best represents you?",
    description: "Select the body structure that most closely matches yours",
    type: "bodyType",
    icon: "👤"
  },
];

export default function OnboardingPage() {
  const user = useUserStore();

  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({
    fitnessLevel: "beginner",
    fitnessGoals: {},
    workoutFrequency: "3-4",
    workoutDuration: "30min",
    bodyStructure: "",
    technicalData: {
      age: "",
      weight: "",
      height: ""
    }
  });
  const [direction, setDirection] = useState<number>(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isGeneratingWorkout, setIsGeneratingWorkout] =
    useState<boolean>(false);
  const { setCurrentWorkout } = useWorkoutStore();

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setDirection(1);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const apiAnswers = mapSurveyValuesToApi(answers);
      try {
        setIsGeneratingWorkout(true);
        await onboardingService.saveOnboardingData(apiAnswers);
        const fetchedUser = await userService.getUserDataByMail(user.email);
        user.setUser({
          ...fetchedUser,
          ...fetchedUser.user_settings,
          ...fetchedUser.user_badges,
          ...fetchedUser.user_goals
        });
        const generatedWorkout = await workoutService.generateWorkout();
        setCurrentWorkout(generatedWorkout);
        navigate("/home");
      } catch {
        toast({
          title: "Error saving onboarding data",
          description: `please try again`,
          variant: "destructive"
        });
        setIsGeneratingWorkout(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAnswerChange = (value: string) => {
    const currentQuestionId = questions[currentQuestion].id;
    setAnswers({
      ...answers,
      [currentQuestionId]: value
    });
  };

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );

    // If removing a goal, also remove its importance from answers
    if (selectedGoals.includes(goalId)) {
      const updatedGoals = { ...answers.fitnessGoals };
      delete updatedGoals[goalId];

      setAnswers({
        ...answers,
        fitnessGoals: updatedGoals
      });
    }

    setAnswers({
      ...answers,
      fitnessGoals: {
        ...answers.fitnessGoals,
        [goalId]: 5
      }
    });
  };

  const handleGoalImportanceChange = (goalId: string, importance: number) => {
    setAnswers({
      ...answers,
      fitnessGoals: {
        ...answers.fitnessGoals,
        [goalId]: importance
      }
    });
  };

  const handleTechnicalDataChange = (
    field: keyof TechnicalData,
    value: string
  ) => {
    setAnswers({
      ...answers,
      technicalData: {
        ...answers.technicalData,
        [field]: value
      }
    });
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    })
  };

  const renderQuestionInput = () => {
    const question = questions[currentQuestion];

    switch (question.type) {
      case "radio": {
        const radioQuestion = question as RadioQuestion;
        return (
          <RadioGroup
            value={answers[radioQuestion.id] as string}
            onValueChange={handleAnswerChange}
            className="space-y-3 mt-4"
          >
            {radioQuestion.options.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className="flex items-center border border-purple-100 p-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                onClick={() => handleAnswerChange(option.value)}
              >
                <div className="flex items-center">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mr-3"
                  />
                </div>
                <div className="grid gap-1 flex-1">
                  <div className="font-medium text-purple-900">
                    {option.label}
                  </div>
                  <p className="text-sm text-purple-600">
                    {option.description}
                  </p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        );
      }

      case "multiGoal": {
        const multiGoalQuestion = question as MultiGoalQuestion;
        return (
          <div className="space-y-4 mt-4">
            {multiGoalQuestion.options.map((option) => (
              <div key={option.id} className="space-y-2">
                <Label
                  htmlFor={option.id}
                  className="flex items-center border border-purple-100 p-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                  onClick={() => handleGoalToggle(option.id)}
                >
                  <div className="flex items-center">
                    <Checkbox
                      id={option.id}
                      checked={selectedGoals.includes(option.id)}
                      onCheckedChange={() => handleGoalToggle(option.id)}
                      className="mr-3"
                    />
                  </div>
                  <div className="grid gap-1 flex-1">
                    <div className="font-medium text-purple-900">
                      {option.label}
                    </div>
                  </div>
                </Label>

                {selectedGoals.includes(option.id) && (
                  <div className="mt-2 px-3">
                    <p className="text-sm text-purple-600 mb-1">
                      How important is this goal to you?
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-purple-500">Low</span>
                      <Slider
                        value={[answers.fitnessGoals[option.id] || 5]}
                        onValueChange={(value) =>
                          handleGoalImportanceChange(option.id, value[0])
                        }
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-purple-500">High</span>
                      <span className="ml-2 min-w-[30px] text-center font-medium text-purple-700">
                        {answers.fitnessGoals[option.id] || 5}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }

      case "bodyType": {
        return (
          <div className="space-y-4 mt-6">
            <RadioGroup
              value={answers[question.id] as string}
              onValueChange={handleAnswerChange}
              className="space-y-4"
            >
              {bodyTypeOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    "relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg",
                    `bg-gradient-to-br ${option.bgColor}`,
                    answers[question.id] === option.value
                      ? `${option.selectedBorder} ${option.selectedBg} shadow-md`
                      : `${option.borderColor} hover:${option.selectedBorder}`
                  )}
                  onClick={() => handleAnswerChange(option.value)}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="absolute top-4 right-4"
                  />

                  <div className="pr-8">
                    <div className="mb-3">
                      <h3
                        className={cn(
                          "text-xl font-bold mb-1 transition-colors",
                          answers[question.id] === option.value
                            ? "text-gray-800"
                            : "text-gray-700"
                        )}
                      >
                        {option.title}
                      </h3>
                      <p
                        className={cn(
                          "text-sm font-medium transition-colors",
                          answers[question.id] === option.value
                            ? "text-gray-600"
                            : "text-gray-500"
                        )}
                      >
                        {option.subtitle}
                      </p>
                    </div>

                    <p
                      className={cn(
                        "text-sm leading-relaxed mb-4 transition-colors",
                        answers[question.id] === option.value
                          ? "text-gray-700"
                          : "text-gray-600"
                      )}
                    >
                      {option.description}
                    </p>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Key Characteristics:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {option.characteristics.map((char, index) => (
                          <div
                            key={index}
                            className={cn(
                              "flex items-center text-xs px-2 py-1.5 rounded-full transition-colors h-6 min-h-[24px]",
                              answers[question.id] === option.value
                                ? "bg-white/60 text-gray-700"
                                : "bg-white/40 text-gray-600"
                            )}
                          >
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0",
                                option.value === "slim"
                                  ? "bg-blue-400"
                                  : option.value === "athletic"
                                  ? "bg-green-400"
                                  : "bg-orange-400"
                              )}
                            />
                            <span className="truncate">{char}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {answers[question.id] === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  )}

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 rounded-xl transition-opacity duration-200 pointer-events-none bg-white/0 hover:bg-white/10" />
                </Label>
              ))}
            </RadioGroup>
          </div>
        );
      }

case "technicalData": {
        return (
          <div className="space-y-8 mt-6">
            {/* Age Input */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {answers.technicalData.age && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="age" className="text-base font-semibold text-gray-800">
                    Age
                  </Label>
                  <p className="text-sm text-gray-500">How old are you?</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-4 transition-all duration-200 group-hover:border-blue-300 focus-within:border-blue-500 focus-within:shadow-lg focus-within:shadow-blue-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={answers.technicalData.age}
                        onChange={(e) => handleTechnicalDataChange("age", e.target.value)}
                        className="border-0 text-2xl font-bold text-gray-800 placeholder-gray-400 bg-transparent focus:ring-0 p-0 h-auto"
                        min="13"
                        max="100"
                      />
                      <div className="text-sm text-gray-500 mt-1">years old</div>
                    </div>
                    <div className="text-4xl opacity-20">🎂</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 ml-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Helps us create age-appropriate workouts</span>
              </div>
            </div>

            {/* Weight Input */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {answers.technicalData.weight && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="weight" className="text-base font-semibold text-gray-800">
                    Weight
                  </Label>
                  <p className="text-sm text-gray-500">Current body weight</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-4 transition-all duration-200 group-hover:border-emerald-300 focus-within:border-emerald-500 focus-within:shadow-lg focus-within:shadow-emerald-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <Input
                          id="weight"
                          type="number"
                          placeholder="70"
                          value={answers.technicalData.weight}
                          onChange={(e) => handleTechnicalDataChange("weight", e.target.value)}
                          className="border-0 text-2xl font-bold text-gray-800 placeholder-gray-400 bg-transparent focus:ring-0 p-0 h-auto w-20"
                          min="30"
                          max="300"
                          step="0.1"
                        />
                        <span className="text-lg font-medium text-gray-600">kg</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">kilograms</div>
                    </div>
                    <div className="text-4xl opacity-20">⚖️</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 ml-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Used for BMI calculation and exercise intensity</span>
              </div>
            </div>

            {/* Height Input */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {answers.technicalData.height && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="height" className="text-base font-semibold text-gray-800">
                    Height
                  </Label>
                  <p className="text-sm text-gray-500">How tall are you?</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-4 transition-all duration-200 group-hover:border-amber-300 focus-within:border-amber-500 focus-within:shadow-lg focus-within:shadow-amber-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <Input
                          id="height"
                          type="number"
                          placeholder="175"
                          value={answers.technicalData.height}
                          onChange={(e) => handleTechnicalDataChange("height", e.target.value)}
                          className="border-0 text-2xl font-bold text-gray-800 placeholder-gray-400 bg-transparent focus:ring-0 p-0 h-auto w-20"
                          min="120"
                          max="250"
                        />
                        <span className="text-lg font-medium text-gray-600">cm</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">centimeters</div>
                    </div>
                    <div className="text-4xl opacity-20">📏</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 ml-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Helps recommend appropriate exercise modifications</span>
              </div>
            </div>

            {/* Enhanced BMI Preview */}
            {answers.technicalData.weight &&
              answers.technicalData.height &&
              parseInt(answers.technicalData.weight) > 0 &&
              parseInt(answers.technicalData.height) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl blur-xl" />
                  <div className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg">Your BMI</h4>
                          <p className="text-sm text-gray-500">Body Mass Index calculated</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                          {(
                            parseInt(answers.technicalData.weight) /
                            Math.pow(parseInt(answers.technicalData.height) / 100, 2)
                          ).toFixed(1)}
                        </div>
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${(() => {
                            const bmi =
                              parseInt(answers.technicalData.weight) /
                              Math.pow(parseInt(answers.technicalData.height) / 100, 2);
                            if (bmi < 18.5) return "bg-blue-100 text-blue-800";
                            if (bmi < 25) return "bg-green-100 text-green-800";
                            if (bmi < 30) return "bg-yellow-100 text-yellow-800";
                            return "bg-red-100 text-red-800";
                          })()}`}
                        >
                          {(() => {
                            const bmi =
                              parseInt(answers.technicalData.weight) /
                              Math.pow(parseInt(answers.technicalData.height) / 100, 2);
                            if (bmi < 18.5) return "Underweight";
                            if (bmi < 25) return "Normal";
                            if (bmi < 30) return "Overweight";
                            return "Obese";
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-100 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>This helps us personalize your workout intensity and nutrition guidance</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const isNextDisabled = (): boolean => {
    const question = questions[currentQuestion];

    if (question.id === "fitnessGoals" && selectedGoals.length === 0) {
      return true;
    }

    if (question.id === "bodyStructure" && !answers.bodyStructure) {
      return true;
    }

    return false;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 py-6 bg-gradient-to-b from-purple-50 to-purple-200">
      <div className="w-full max-w-md mb-8">
        <img
          src="/GainPlay.png"
          alt="GainPlay Logo"
          width={120}
          height={120}
          className="mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-center text-purple-800">
          Let's Personalize Your Experience
        </h1>
        <p className="text-center text-purple-600 mt-2">
          Help us understand your fitness goals
        </p>
      </div>

      {/* Stepper */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between relative">
          {questions.map((_, index) => (
            <div key={index} className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < currentQuestion
                    ? "bg-purple-600 text-white"
                    : index === currentQuestion
                    ? "bg-purple-600 text-white ring-4 ring-purple-200"
                    : "bg-purple-200 text-purple-400"
                }`}
              >
                {index < currentQuestion ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
            </div>
          ))}
          {/* Connecting lines */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-purple-200">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{
                width: `${(currentQuestion / (questions.length - 1)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-lg border-purple-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-center text-4xl mb-2">
            {questions[currentQuestion].icon}
          </div>
          <CardTitle className="text-2xl font-bold text-center text-purple-800">
            {questions[currentQuestion].question}
          </CardTitle>
          <CardDescription className="text-center text-purple-600">
            {questions[currentQuestion].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentQuestion}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 35,
                mass: 1.5
              }}
              className="w-full"
            >
              {renderQuestionInput()}

              <div className="flex justify-between gap-4 mt-8">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  disabled={currentQuestion === 0}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700 flex-1"
                  disabled={isNextDisabled()}
                >
                  {currentQuestion < questions.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    "Finish"
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {isGeneratingWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-[90%] mx-auto"
          >
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <motion.div
                  className="w-20 h-20 rounded-full border-4 border-purple-100"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(147, 51, 234, 0.2)",
                      "0 0 0 10px rgba(147, 51, 234, 0)",
                      "0 0 0 0 rgba(147, 51, 234, 0)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear"
                  }}
                >
                  <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-purple-600" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut"
                  }}
                >
                  <Dumbbell className="h-8 w-8 text-purple-600" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-2">
                Creating your workout plan
              </h3>
              <p className="text-purple-600 text-sm text-center">
                Personalizing exercises based on your goals
              </p>

              <motion.div
                className="w-full mt-4 h-1.5 bg-purple-100 rounded-full overflow-hidden"
                initial={{ width: "100%" }}
              >
                <motion.div
                  className="h-full bg-purple-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 4.5,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="mt-8 text-center text-purple-600">
        <p>
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>
    </div>
  );
}
