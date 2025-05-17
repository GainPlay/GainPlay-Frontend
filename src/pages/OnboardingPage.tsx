import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, ArrowLeft, Dumbbell } from "lucide-react";
import { mapSurveyValuesToApi } from "@/utils/surveyMap";
import { onboardingService } from "@/services/onboardingservice";
import slimBuilder from "../assets/slim builder.png";
import athleticBuilder from "../assets/Athletic Builder.png";
import solidBuilder from "../assets/solid builder.png";

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
  type: "bodyType";
  options: Option[];
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

const questions: Question[] = [
  {
    id: "fitnessLevel",
    question: "What's your current fitness level?",
    description: "Be honest about where you are today",
    type: "radio",
    options: [
      {
        value: "beginner",
        label: "Beginner",
        description: "New to fitness or returning after a long break",
      },
      {
        value: "intermediate",
        label: "Intermediate",
        description: "Exercise regularly with some experience",
      },
      {
        value: "advanced",
        label: "Advanced",
        description: "Consistent training with good knowledge",
      },
      {
        value: "expert",
        label: "Expert",
        description: "Highly trained with extensive experience",
      },
    ],
    icon: "📊",
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
      { id: "maintainHealth", label: "Maintain Health" },
    ],
    icon: "🎯",
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
        description: "Getting started",
      },
      {
        value: "3-4",
        label: "3-4 times per week",
        description: "Consistent routine",
      },
      {
        value: "5-6",
        label: "5-6 times per week",
        description: "Dedicated schedule",
      },
      { value: "daily", label: "Daily", description: "Full commitment" },
    ],
    icon: "📅",
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
        description: "Extended training",
      },
    ],
    icon: "⏱️",
  },
  {
    id: "bodyStructure",
    question: "Which body type best represents you?",
    description: "Select the body structure that most closely matches yours",
    type: "bodyType",
    options: [
      {
        value: "slim",
        label: "Slim Builder",
        description:
          "Naturally lean, finds it harder to gain weight or muscle. Fast metabolism, narrow frame.",
        image: slimBuilder,
      },
      {
        value: "athletic",
        label: "Athletic Builder",
        description:
          "Naturally muscular and athletic. Gains muscle easily and maintains a balanced physique.",
        image: athleticBuilder,
      },
      {
        value: "solid",
        label: "Solid Builder",
        description:
          "Naturally broader and rounder. Tends to store fat easily and may struggle with weight loss.",
        image: solidBuilder,
      },
    ],
    icon: "👤",
  },
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
        placeholder: "Enter your age",
      },
      {
        id: "weight",
        label: "Weight (kg)",
        type: "number",
        placeholder: "Enter your weight in kg",
      },
      {
        id: "height",
        label: "Height (cm)",
        type: "number",
        placeholder: "Enter your height in cm",
      },
    ],
    icon: "📋",
  },
];

export default function OnboardingPage() {
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
      height: "",
    },
  });
  const [direction, setDirection] = useState<number>(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isGeneratingWorkout, setIsGeneratingWorkout] =
    useState<boolean>(false);

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setDirection(1);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Save answers and show loading animation
      localStorage.setItem("userGoals", JSON.stringify(answers));
      const apiAnswers = mapSurveyValuesToApi(answers);
      const response = onboardingService.saveOnboardingData(apiAnswers);

      // if (response.status !== 200) {
      //   console.error("Error saving onboarding data");
      // }
      console.log(response);
      setIsGeneratingWorkout(true);

      // Simulate workout generation with a timeout
      setTimeout(() => {
        navigate("/home");
      }, 5000);
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
      [currentQuestionId]: value,
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
        fitnessGoals: updatedGoals,
      });
    }
  };

  const handleGoalImportanceChange = (goalId: string, importance: number) => {
    setAnswers({
      ...answers,
      fitnessGoals: {
        ...answers.fitnessGoals,
        [goalId]: importance,
      },
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
        [field]: value,
      },
    });
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
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
        const bodyTypeQuestion = question as BodyTypeQuestion;
        return (
          <RadioGroup
            value={answers[bodyTypeQuestion.id] as string}
            onValueChange={handleAnswerChange}
            className="space-y-4 mt-4"
          >
            {bodyTypeQuestion.options.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className="flex flex-col border border-purple-100 p-4 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                onClick={() => handleAnswerChange(option.value)}
              >
                <div className="flex items-center">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mr-3"
                  />
                  <div className="grid gap-1 flex-1">
                    <div className="font-medium text-purple-900">
                      {option.label}
                    </div>
                    <p className="text-sm text-purple-600">
                      {option.description}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-center">
                  <img
                    src={option.image || "/placeholder.svg"}
                    alt={option.label}
                    width={150}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              </Label>
            ))}
          </RadioGroup>
        );
      }

      case "technicalData": {
        const technicalDataQuestion = question as TechnicalDataQuestion;
        return (
          <div className="space-y-4 mt-4">
            {technicalDataQuestion.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label
                  htmlFor={field.id}
                  className="font-medium text-purple-900"
                >
                  {field.label}
                </Label>
                <Input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={answers.technicalData[field.id as keyof TechnicalData]}
                  onChange={(e) =>
                    handleTechnicalDataChange(
                      field.id as keyof TechnicalData,
                      e.target.value
                    )
                  }
                  className="w-full"
                />
              </div>
            ))}
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
                width: `${(currentQuestion / (questions.length - 1)) * 100}%`,
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
                mass: 1.5,
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
                      "0 0 0 0 rgba(147, 51, 234, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-purple-600" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
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
                    ease: "easeInOut",
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
