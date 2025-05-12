import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  Check,
  PlayCircle,
  AlertCircle,
  Coins,
  ChevronRight,
  ChevronLeft,
  Clock,
  Zap,
  Star,
  BarChart,
  Calendar,
  Dumbbell,
  FlameIcon as Fire,
  Trophy
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { cn } from "@/lib/utils";
import FallbackExerciseImage from "../components/FallbackExerciseImage";
import ExerciseAssistant from "../components/ExerciseAssistant";
import { useNavigate } from "react-router-dom";
import { FrontendBadge } from "@/types";

type Exercise = {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  restTime: number; // in seconds
  instruction: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  muscleGroup: string;
  xpReward: number;
  sets: Array<{ completed: boolean; reps: number }>;
  currentSet: number;
  currentReps: number;
  tips: string[];
};

const initialExercises: Exercise[] = [
  {
    id: "pushups",
    name: "Push-ups",
    targetSets: 3,
    targetReps: 10,
    restTime: 60,
    instruction:
      "Keep your body straight, lower until your chest nearly touches the floor, then push back up.",
    difficulty: "intermediate",
    muscleGroup: "Chest, Shoulders, Triceps",
    xpReward: 100,
    sets: Array(3).fill({ completed: false, reps: 0 }),
    currentSet: 0,
    currentReps: 0,
    tips: [
      "Keep your core tight throughout the movement",
      "Don't let your hips sag or pike up",
      "Breathe out as you push up",
      "For easier version, do push-ups on your knees"
    ]
  },
  {
    id: "squats",
    name: "Squats",
    targetSets: 3,
    targetReps: 15,
    restTime: 45,
    instruction:
      "Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then return to standing.",
    difficulty: "beginner",
    muscleGroup: "Quadriceps, Hamstrings, Glutes",
    xpReward: 120,
    sets: Array(3).fill({ completed: false, reps: 0 }),
    currentSet: 0,
    currentReps: 0,
    tips: [
      "Keep your chest up and back straight",
      "Push your knees outward as you descend",
      "Go as low as comfortable, ideally thighs parallel to ground",
      "Push through your heels when standing up"
    ]
  },
  {
    id: "plank",
    name: "Plank",
    targetSets: 3,
    targetReps: 30, // seconds
    restTime: 30,
    instruction:
      "Hold a push-up position with your weight on your forearms, keeping your body in a straight line.",
    difficulty: "intermediate",
    muscleGroup: "Core, Shoulders",
    xpReward: 150,
    sets: Array(3).fill({ completed: false, reps: 0 }),
    currentSet: 0,
    currentReps: 0,
    tips: [
      "Keep your shoulders directly above your elbows",
      "Engage your core and glutes",
      "Don't let your hips sag or pike up",
      "Look slightly forward, not straight down"
    ]
  },
  {
    id: "lunges",
    name: "Lunges",
    targetSets: 3,
    targetReps: 12,
    restTime: 45,
    instruction:
      "Step forward with one leg, lowering your hips until both knees are bent at 90 degrees, then return to standing.",
    difficulty: "intermediate",
    muscleGroup: "Quadriceps, Hamstrings, Glutes",
    xpReward: 120,
    sets: Array(3).fill({ completed: false, reps: 0 }),
    currentSet: 0,
    currentReps: 0,
    tips: [
      "Keep your upper body straight",
      "Step far enough forward that your knee stays above your ankle",
      "Push back up through your front heel",
      "Alternate legs for each rep"
    ]
  },
  {
    id: "mountainClimbers",
    name: "Mountain Climbers",
    targetSets: 3,
    targetReps: 20,
    restTime: 30,
    instruction:
      "Start in a plank position and alternate bringing each knee toward your chest in a running motion.",
    difficulty: "intermediate",
    muscleGroup: "Core, Shoulders, Hip Flexors",
    xpReward: 130,
    sets: Array(3).fill({ completed: false, reps: 0 }),
    currentSet: 0,
    currentReps: 0,
    tips: [
      "Keep your hips down and core engaged",
      "Move your legs as quickly as you can while maintaining form",
      "Breathe rhythmically throughout the exercise",
      "Each knee drive counts as one rep"
    ]
  }
];

// Motivational quotes for fitness
const motivationalQuotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Fitness is not about being better than someone else. It's about being better than you used to be.",
  "The hardest lift of all is lifting your butt off the couch.",
  "Don't wish for it, work for it.",
  "Sweat is just fat crying.",
  "You don't have to be extreme, just consistent.",
  "The only way to define your limits is by going beyond them.",
  "Your health is an investment, not an expense."
];

export default function HomePage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    if (typeof window !== "undefined") {
      const savedExercises = localStorage.getItem("currentWorkout");
      return savedExercises ? JSON.parse(savedExercises) : [];
    }
    return [];
  });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showMaxSetsAlert, setShowMaxSetsAlert] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");
  const [coins, setCoins] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  // Add a new state variable for earned badges after the earnedXP state
  const [earnedBadges, setEarnedBadges] = useState<
    Array<{ id: string; name: string; icon: string }>
  >([]);
  const [restMode, setRestMode] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [showExerciseComplete, setShowExerciseComplete] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [quote, setQuote] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isDailyChallengeDone, setIsDailyChallengeDone] = useState(false);
  const [dailyChallengeProgress, setDailyChallengeProgress] = useState(15);
  const [showChallengeComplete, setShowChallengeComplete] = useState(false);

  useEffect(() => {
    const storedAvatar = localStorage.getItem("currentAvatar");
    const storedCoins = localStorage.getItem("userCoins");
    const storedLevel = localStorage.getItem("userLevel");
    const storedStreak = localStorage.getItem("userStreak");

    if (storedAvatar) setUserAvatar(storedAvatar);
    if (storedCoins) setCoins(Number.parseInt(storedCoins));
    if (storedLevel) setLevel(Number.parseInt(storedLevel));
    if (storedStreak) setStreak(Number.parseInt(storedStreak));

    // Set a random motivational quote
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
  }, []);

  useEffect(() => {
    if (exercises.length > 0) {
      localStorage.setItem("currentWorkout", JSON.stringify(exercises));
    }
  }, [exercises]);

  useEffect(() => {
    if (restMode && restTimeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setRestTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (restMode && restTimeRemaining === 0) {
      setRestMode(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [restMode, restTimeRemaining]);

  const handleRepsChange = (increment: boolean) => {
    if (currentExerciseIndex >= exercises.length) return;

    setExercises((prevExercises) => {
      const newExercises = [...prevExercises];
      const exercise = newExercises[currentExerciseIndex];
      exercise.currentReps = Math.max(
        0,
        increment ? exercise.currentReps + 1 : exercise.currentReps - 1
      );
      return newExercises;
    });
  };

  const submitSet = () => {
    if (currentExerciseIndex >= exercises.length) return;

    setExercises((prevExercises) => {
      const newExercises = [...prevExercises];
      const exercise = newExercises[currentExerciseIndex];

      if (exercise.currentSet >= exercise.targetSets) {
        setShowMaxSetsAlert(true);
        setTimeout(() => setShowMaxSetsAlert(false), 3000);
        return newExercises;
      }

      const newSets = [...exercise.sets];
      newSets[exercise.currentSet] = {
        completed: true,
        reps: exercise.currentReps
      };

      newExercises[currentExerciseIndex] = {
        ...exercise,
        sets: newSets,
        currentSet: exercise.currentSet + 1,
        currentReps: 0
      };

      return newExercises;
    });

    // Check if all sets for this exercise are completed
    const updatedExercise = exercises[currentExerciseIndex];
    const nextSetIndex = updatedExercise.currentSet + 1;

    if (nextSetIndex >= updatedExercise.targetSets) {
      // Exercise completed
      setShowExerciseComplete(true);
      setTimeout(() => {
        setShowExerciseComplete(false);
        // If there are more exercises, start rest timer
        if (currentExerciseIndex < exercises.length - 1) {
          setRestMode(true);
          setRestTimeRemaining(exercises[currentExerciseIndex].restTime);
        }
      }, 2000);
    } else {
      // Start rest timer between sets
      setRestMode(true);
      setRestTimeRemaining(exercises[currentExerciseIndex].restTime);
    }
  };

  const moveToNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setShowTips(false);
    }
  };

  const moveToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setShowTips(false);
    }
  };

  const startWorkout = () => {
    const savedExercises = localStorage.getItem("currentWorkout");
    if (savedExercises) {
      const parsedExercises = JSON.parse(savedExercises);
      // Check if workout was completed
      const allCompleted = parsedExercises.every(
        (ex: Exercise) =>
          ex.sets.filter((set) => set.completed).length === ex.targetSets
      );

      if (allCompleted) {
        // Reset workout if it was completed
        setExercises(initialExercises);
      } else {
        setExercises(parsedExercises);
      }
    } else {
      setExercises(initialExercises);
    }
    setCurrentExerciseIndex(0);
    setWorkoutStarted(true);
  };

  const skipRest = () => {
    setRestMode(false);
    if (
      exercises[currentExerciseIndex].currentSet >=
      exercises[currentExerciseIndex].targetSets
    ) {
      moveToNextExercise();
    }
  };

  const finishWorkout = () => {
    // Calculate total XP and coins earned
    let totalXP = 0;
    const completedExercises = exercises.map((exercise) => {
      const completedSets = exercise.sets.filter((set) => set.completed).length;
      const completionPercentage = completedSets / exercise.targetSets;
      const exerciseXP = Math.round(exercise.xpReward * completionPercentage);
      totalXP += exerciseXP;

      return {
        name: exercise.name,
        sets: exercise.sets,
        totalReps: exercise.sets.reduce((total, set) => total + set.reps, 0),
        xpEarned: exerciseXP
      };
    });

    // Save the completed workout to local storage
    const workoutHistory = JSON.parse(
      localStorage.getItem("workoutHistory") || "[]"
    );
    workoutHistory.push({
      date: new Date().toISOString(),
      exercises: completedExercises
    });
    localStorage.setItem("workoutHistory", JSON.stringify(workoutHistory));

    // Update streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("userStreak", newStreak.toString());

    // Add coins and XP for completing the workout
    const newEarnedCoins = Math.round(totalXP / 2); // Convert XP to coins at a 2:1 ratio
    const newCoins = coins + newEarnedCoins;
    setCoins(newCoins);
    setEarnedCoins(newEarnedCoins);
    setEarnedXP(totalXP);
    localStorage.setItem("userCoins", newCoins.toString());

    // Update level based on XP
    const currentXP = Number.parseInt(localStorage.getItem("userXP") || "0");
    const newTotalXP = currentXP + totalXP;
    localStorage.setItem("userXP", newTotalXP.toString());

    // Simple level calculation (100 XP per level)
    const newLevel = Math.floor(newTotalXP / 100) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      localStorage.setItem("userLevel", newLevel.toString());
    }

    // Check for any badges earned
    const checkForEarnedBadges = () => {
      const newBadges = [];

      // Example badge conditions - replace with your actual badge logic
      if (totalXP > 300) {
        newBadges.push({
          id: "high-performer",
          name: "High Performer",
          icon: "🏆"
        });
      }

      if (
        exercises.every(
          (ex) =>
            ex.sets.filter((set) => set.completed).length === ex.targetSets
        )
      ) {
        newBadges.push({
          id: "completionist",
          name: "Completionist",
          icon: "✅"
        });
      }

      // First workout badge
      if (workoutHistory.length === 0) {
        newBadges.push({
          id: "first-workout",
          name: "First Steps",
          icon: "🌱"
        });
      }

      // Add badges to user's collection if they're new
      if (newBadges.length > 0) {
        const userBadges = JSON.parse(
          localStorage.getItem("userBadges") || "[]"
        );
        const newUserBadges = [...userBadges];

        newBadges.forEach((badge) => {
          if (!userBadges.some((b: FrontendBadge) => b.id === badge.id)) {
            newUserBadges.push({
              ...badge,
              earnedAt: new Date().toISOString()
            });
          }
        });

        localStorage.setItem("userBadges", JSON.stringify(newUserBadges));
        setEarnedBadges(newBadges);
      }
    };

    checkForEarnedBadges();

    // Show confetti and coin animation
    setShowConfetti(true);
    localStorage.removeItem("currentWorkout");
    setWorkoutStarted(false);
  };

  const closePopup = () => {
    setShowConfetti(false);
    setExercises([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const currentExercise = exercises[currentExerciseIndex];

  const startDailyChallenge = () => {
    if (isDailyChallengeDone) return;

    // Simulate progress update
    setDailyChallengeProgress((prev) => Math.min(prev + 5, 50));

    // If challenge is completed
    if (dailyChallengeProgress + 5 >= 50) {
      setIsDailyChallengeDone(true);
      // Add coins and save to localStorage
      const newCoins = coins + 50;
      setCoins(newCoins);
      localStorage.setItem("userCoins", newCoins.toString());

      // Show celebration popup
      setShowChallengeComplete(true);
      setTimeout(() => {
        setShowChallengeComplete(false);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-purple-100 p-4 pb-20">
      {showConfetti && (
        <>
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
            tweenDuration={3000}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4"
            >
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-purple-800 relative z-10">
                  Workout Complete!
                </h2>
              </div>
              <div className="h-1 w-20 bg-purple-600 mx-auto mb-6"></div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-purple-600">XP Earned</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {earnedXP}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-purple-600">Coins Earned</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {earnedCoins}
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <BarChart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-purple-600">Workout Score</p>
                <p className="text-2xl font-bold text-purple-800">
                  {Math.min(Math.round(earnedXP / 2), 100)}/100
                </p>
                <div className="w-full bg-purple-200 h-2 rounded-full mt-2">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(Math.round(earnedXP / 2), 100)}%`
                    }}
                  />
                </div>
              </div>

              {earnedBadges.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg mb-6">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-purple-600 mb-3">Badges Earned</p>

                  <div className="flex justify-center gap-4">
                    {earnedBadges.map((badge) => (
                      <motion.div
                        key={badge.id}
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          delay: 0.3,
                          duration: 0.5
                        }}
                        className="flex flex-col items-center"
                      >
                        <div className="text-4xl mb-1 bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-md">
                          {badge.icon}
                        </div>
                        <p className="text-xs font-medium text-purple-700 mt-1 max-w-[80px] text-center">
                          {badge.name}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={closePopup}
                className="bg-purple-600 hover:bg-purple-700 w-full"
              >
                Continue
              </Button>
            </motion.div>
          </div>
        </>
      )}

      <header className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/profile")}
          className="p-0 h-10 w-10 rounded-full overflow-hidden"
        >
          <img
            src={
              userAvatar ||
              "https://api.dicebear.com/6.x/avataaars/svg?seed=default"
            }
            alt="User Avatar"
            className="h-full w-full object-cover"
          />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800">GainPlay</h1>
        <div className="flex items-center bg-purple-200 px-2 py-1 rounded-full">
          <Coins className="w-4 h-4 mr-1 text-yellow-500" />
          <span className="font-bold text-purple-600 text-sm">{coins}</span>
        </div>
      </header>

      {showMaxSetsAlert && (
        <Alert
          variant="destructive"
          className="mb-4 animate-in slide-in-from-top"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Maximum Sets Reached</AlertTitle>
          <AlertDescription>
            You've reached the maximum sets for this exercise. Great work! 💪
          </AlertDescription>
        </Alert>
      )}

      {showExerciseComplete && (
        <Alert className="mb-4 animate-in slide-in-from-top bg-green-100 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Exercise Complete!</AlertTitle>
          <AlertDescription className="text-green-700">
            You've completed all sets for this exercise. Keep up the good work!
          </AlertDescription>
        </Alert>
      )}

      {!workoutStarted ? (
        <>
          <Card className="mb-6 overflow-hidden border-none shadow-md">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Today's Focus
              </h3>
              <p className="text-purple-100 text-sm">
                Stay consistent and track your progress
              </p>
            </div>
            <CardContent className="p-0">
              <div className="grid grid-cols-3 divide-x divide-y">
                <div className="p-4 text-center hover:bg-purple-50 transition-colors">
                  <div className="font-bold text-2xl text-purple-700 mb-1">
                    {streak}
                  </div>
                  <div className="text-xs text-purple-600">Day Streak</div>
                </div>
                <div className="p-4 text-center hover:bg-purple-50 transition-colors">
                  <div className="font-bold text-2xl text-purple-700 mb-1">
                    {level}
                  </div>
                  <div className="text-xs text-purple-600">Current Level</div>
                </div>
                <div className="p-4 text-center hover:bg-purple-50 transition-colors">
                  <div className="font-bold text-2xl text-purple-700 mb-1">
                    {
                      JSON.parse(localStorage.getItem("workoutHistory") || "[]")
                        .length
                    }
                  </div>
                  <div className="text-xs text-purple-600">Workouts Done</div>
                </div>
                <div
                  className="p-4 text-center col-span-3 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                  onClick={startWorkout}
                >
                  <div className="flex items-center justify-center gap-2 text-purple-700 font-medium">
                    <PlayCircle className="w-5 h-5" />
                    <span>Start Today's Workout</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-4">
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Daily Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-1">
                  Complete 50 Push-ups Today
                </h3>
                <p className="text-sm text-gray-600">
                  Earn bonus XP and coins by completing this challenge
                </p>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${dailyChallengeProgress * 2}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{dailyChallengeProgress}/50 completed</span>
                <span>+100 XP</span>
              </div>
              <Button
                className={`w-full mt-4 ${
                  isDailyChallengeDone
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                }`}
                onClick={startDailyChallenge}
                disabled={isDailyChallengeDone}
              >
                {isDailyChallengeDone
                  ? "Challenge Completed! ✓"
                  : "Do 5 Push-ups"}
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <BarChart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Workout History
                    </h3>
                    <p className="text-xs text-green-600">
                      Track your progress over time
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/workout-history")}
                  className="text-green-600 hover:bg-green-200"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Calendar className="h-5 w-5 text-purple-600" />
                Upcoming Workout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium">Your Next Workout</h3>
                  <p className="text-sm text-muted-foreground">
                    Focus: Full Body
                  </p>
                </div>
                <div className="bg-purple-100 px-2 py-1 rounded text-xs font-medium text-purple-700">
                  5 exercises
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Dumbbell className="h-4 w-4 text-purple-500" />
                  <span>Push-ups</span>
                  <span className="ml-auto text-xs text-purple-600">
                    3 × 10
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Dumbbell className="h-4 w-4 text-purple-500" />
                  <span>Squats</span>
                  <span className="ml-auto text-xs text-purple-600">
                    3 × 15
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Dumbbell className="h-4 w-4 text-purple-500" />
                  <span>Plank</span>
                  <span className="ml-auto text-xs text-purple-600">
                    3 × 30s
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Dumbbell className="h-4 w-4 text-purple-500" />
                  <span>Lunges</span>
                  <span className="ml-auto text-xs text-purple-600">
                    3 × 12
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Dumbbell className="h-4 w-4 text-purple-500" />
                  <span>Mountain Climbers</span>
                  <span className="ml-auto text-xs text-purple-600">
                    3 × 20
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="text-purple-800 font-medium mb-2">
                  Motivational Quote
                </div>
                <p className="text-purple-700 italic">"{quote}"</p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : restMode ? (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full"
            >
              <Clock className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-purple-800 mb-2">
                Rest Time
              </h2>
              <p className="text-purple-600 mb-2">
                Take a breather before the next{" "}
                {currentExercise.currentSet >= currentExercise.targetSets
                  ? "exercise"
                  : "set"}
              </p>

              <div className="w-full bg-purple-200 h-4 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-purple-600"
                  style={{
                    width: `${
                      (restTimeRemaining /
                        exercises[currentExerciseIndex].restTime) *
                      100
                    }%`
                  }}
                />
              </div>

              <p className="text-4xl font-bold text-purple-800 mb-6">
                {formatTime(restTimeRemaining)}
              </p>

              <Button
                onClick={skipRest}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full"
              >
                Skip Rest
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-purple-600">
                Workout Progress
              </span>
              <span className="text-sm font-medium text-purple-600">
                {currentExerciseIndex + 1} of {exercises.length} exercises
              </span>
            </div>
            <div className="w-full bg-purple-200 h-2 rounded-full">
              <div
                className="bg-purple-600 h-full rounded-full"
                style={{
                  width: `${(currentExerciseIndex / exercises.length) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={moveToPreviousExercise}
              disabled={currentExerciseIndex === 0}
              className="text-purple-600 border-purple-300"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={moveToNextExercise}
              disabled={currentExerciseIndex === exercises.length - 1}
              className="text-purple-600 border-purple-300"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentExerciseIndex}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="mb-6 overflow-hidden">
                <div className="relative h-64 bg-purple-50">
                  <FallbackExerciseImage
                    exerciseName={currentExercise.name}
                    className="h-64"
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-bold text-white rounded-full",
                        getDifficultyColor(currentExercise.difficulty)
                      )}
                    >
                      {currentExercise.difficulty}
                    </span>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold text-purple-800">
                      {currentExercise.name}
                    </CardTitle>
                    <div className="flex items-center bg-purple-100 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      <span className="text-sm font-medium text-purple-700">
                        {currentExercise.xpReward} XP
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-purple-600">
                    {currentExercise.muscleGroup}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="bg-purple-50 p-3 rounded-lg mb-4 text-sm text-purple-700">
                    <p>{currentExercise.instruction}</p>
                  </div>

                  {showTips && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4"
                    >
                      <h4 className="font-medium text-yellow-800 mb-2">
                        Pro Tips:
                      </h4>
                      <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
                        {currentExercise.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        Set {currentExercise.currentSet + 1} of{" "}
                        {currentExercise.targetSets}
                      </span>
                      <span className="text-sm text-purple-600">
                        {
                          currentExercise.sets.filter((set) => set.completed)
                            .length
                        }{" "}
                        sets completed
                      </span>
                    </div>
                    <Progress
                      value={
                        (currentExercise.currentSet /
                          currentExercise.targetSets) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  {currentExercise.currentSet < currentExercise.targetSets ? (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-purple-600 mb-2">
                          Target: {currentExercise.targetReps} reps
                        </p>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRepsChange(false)}
                            className="h-12 w-12 rounded-full border-2 border-purple-300"
                          >
                            <span className="text-2xl font-bold text-purple-600">
                              -
                            </span>
                          </Button>
                          <div className="bg-purple-100 h-20 w-20 rounded-full flex items-center justify-center">
                            <span className="text-3xl font-bold text-purple-800">
                              {currentExercise.currentReps}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRepsChange(true)}
                            className="h-12 w-12 rounded-full border-2 border-purple-300"
                          >
                            <span className="text-2xl font-bold text-purple-600">
                              +
                            </span>
                          </Button>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 py-3"
                        onClick={submitSet}
                      >
                        Complete Set {currentExercise.currentSet + 1}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-700">
                        All sets completed! 🎉
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Move to the next exercise
                      </p>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {currentExercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className={`text-center p-2 rounded ${
                          set.completed
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <div className="text-xs font-medium">
                          Set {setIndex + 1}
                        </div>
                        <div className="text-sm">
                          {set.completed ? set.reps : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4 mb-6">
            <Button
              onClick={finishWorkout}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              Finish Workout
            </Button>
          </div>
        </>
      )}
      {workoutStarted && !restMode && currentExercise && (
        <ExerciseAssistant exerciseName={currentExercise.name} />
      )}
      {showChallengeComplete && (
        <>
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={150}
            gravity={0.3}
            tweenDuration={3000}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md w-full mx-4"
            >
              <div className="mb-4 relative">
                <div className="flex justify-center">
                  <Fire className="w-20 h-20 text-orange-300 opacity-20" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-purple-800 relative z-10">
                    Challenge Complete!
                  </h2>
                </div>
              </div>
              <div className="h-1 w-20 bg-orange-500 mx-auto mb-4"></div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-purple-600">Coins Earned</p>
                  <p className="text-2xl font-bold text-purple-800">50</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-purple-600">XP Earned</p>
                  <p className="text-2xl font-bold text-purple-800">100</p>
                </div>
              </div>

              <Button
                onClick={() => setShowChallengeComplete(false)}
                className="bg-orange-500 hover:bg-orange-600 w-full"
              >
                Awesome!
              </Button>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
