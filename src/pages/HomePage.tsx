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
  BarChart,
  Calendar,
  Dumbbell,
  FlameIcon as Fire,
  Trophy,
  Loader2,
  X,
  AlertTriangle,
  Play,
  Pause,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { cn } from "@/lib/utils";
import FallbackExerciseImage from "../components/FallbackExerciseImage";
import ExerciseAssistant from "../components/ExerciseAssistant";
import { useNavigate } from "react-router-dom";
import {
  difficultyMap,
  type DifficultyLevel,
  type ExerciseDifficulty,
  type Workout,
  type WorkoutUIExercise,
} from "../types";
import { workoutService } from "@/services/workoutService";
import { updateSetUtils, XP_CONST } from "@/utils/workout.utils";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { Challenge, challengeService } from "@/services/challegeService";
import { motivationalQuotes } from "@/utils/constants/motivationalQuotes";
import { useUserStore } from "@/stores/useUserStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";

const DAILY_CHALLENGE_KEY = "dailyChallenge";
const DAILY_CHALLENGE_DATE_KEY = "dailyChallengeDate";

// Convert API workout to UI format
const convertApiWorkoutToUIFormat = (workout: Workout): WorkoutUIExercise[] => {
  if (!workout || !workout.workout_exercises) return [];

  return workout.workout_exercises.map((workoutExercise) => {
    const exercise = workoutExercise.exercises;
    const template = workoutExercise.exercise_templates;

    let difficultyString: ExerciseDifficulty = "beginner";
    if (exercise?.difficulty_level) {
      difficultyString =
        difficultyMap[exercise.difficulty_level as DifficultyLevel];
    }

    // Convert exercise sets to UI format
    const sets = workoutExercise.exercise_sets.map((set) => ({
      id: set.id, // Include the set ID
      completed: (set.completed_reps || 0) > 0,
      reps: set.completed_reps || 0,
    }));

    // Find the current set (first incomplete set)
    const currentSetIndex = sets.findIndex((set) => !set.completed);

    return {
      id: workoutExercise.id,
      name: exercise?.name || "Unknown Exercise",
      targetSets: template?.target_sets || 3,
      targetReps: template?.target_reps || 10,
      restTime: template?.rest_time_seconds || 60,
      instruction:
        exercise?.description || "Perform the exercise with proper form.",
      difficulty: difficultyString,
      muscleGroup: exercise?.muscle_group || "Full Body",
      xpReward: XP_CONST * (exercise?.difficulty_level ?? 1),
      sets: sets,
      currentSet: currentSetIndex >= 0 ? currentSetIndex : 0,
      currentReps: 0,
      tips: [
        "Keep proper form throughout the exercise",
        "Breathe properly during the movement",
        "Focus on muscle contraction",
        "Maintain a controlled tempo",
      ],
      exerciseId: exercise?.id || 0,
      workoutExerciseId: workoutExercise.id,
      templateId: template?.id || 0,
    };
  });
};

export default function HomePage() {
  const navigate = useNavigate();
  const user = useUserStore();
  // Replace the useState for exercises with this
  const [exercises, setExercises] = useState<WorkoutUIExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showMaxSetsAlert, setShowMaxSetsAlert] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");
  const [coins, setCoins] = useState(0);
  const [workoutsDone, setWorkoutsDone] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedScore, setEarnedScore] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<
    Array<{ id: string; name: string; icon: string }>
  >([]);
  const [restMode, setRestMode] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isRestPaused, setIsRestPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [showExerciseComplete, setShowExerciseComplete] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [quote, setQuote] = useState("");
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isDailyChallengeDone, setIsDailyChallengeDone] = useState(false);
  const [dailyChallengeProgress, setDailyChallengeProgress] = useState(0);
  const [showChallengeComplete, setShowChallengeComplete] = useState(false);
  const [todaysChallenge, setTodaysChallenge] = useState<Challenge | null>(
    null
  );

  // Add loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWorkoutId, setCurrentWorkoutId] = useState<number | null>(null);

  // Add state for the original API workout
  const [originalWorkout, setOriginalWorkout] = useState<Workout | null>(null);

  const { currentWorkout, setCurrentWorkout } = useWorkoutStore();
  const [upcomingWorkout, setUpcomingWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    const today = new Date().toDateString(); // Normalize date to day
    const savedDate = localStorage.getItem(DAILY_CHALLENGE_DATE_KEY);
    const localStorageDailyChallenge =
      localStorage.getItem(DAILY_CHALLENGE_KEY);

    if (savedDate !== today) {
      // New day — reset the challenge
      const initialProgress = 0;
      localStorage.setItem(
        DAILY_CHALLENGE_KEY,
        JSON.stringify(initialProgress)
      );
      localStorage.setItem(DAILY_CHALLENGE_DATE_KEY, today);
      setDailyChallengeProgress(initialProgress);
      setIsDailyChallengeDone(false);
      return;
    }

    // Same day — load existing progress
    if (localStorageDailyChallenge) {
      const dailyChallengeProgress = JSON.parse(localStorageDailyChallenge);
      setDailyChallengeProgress(dailyChallengeProgress);

      if (dailyChallengeProgress === todaysChallenge?.repetitions) {
        setIsDailyChallengeDone(true);
      }
    }
  }, [todaysChallenge]);

  useEffect(() => {
    const fetchUpcomingWorkout = async () => {
      try {
        if (!currentWorkout) {
          const fetchedWorkout = await workoutService.getCurrentWorkout();
          setUpcomingWorkout(fetchedWorkout);
        } else {
          setUpcomingWorkout(currentWorkout);
        }
      } catch (error) {
        console.error("Error fetching upcoming workout:", error);
      }
    };

    fetchUpcomingWorkout();
  }, [currentWorkout]);

  useEffect(() => {
    const fetchTodaysChallenge = async () => {
      try {
        const fetchedChallenge = await challengeService.generateChallenge();

        setTodaysChallenge(fetchedChallenge);
      } catch (error) {
        console.error("Error fetching upcoming workout:", error);
      }
    };

    fetchTodaysChallenge();
  }, []);

  useEffect(() => {
    const fetchWorkoutsDone = async () => {
      try {
        const workoutsDone = (await workoutService.getWorkoutHistory()).length;

        setWorkoutsDone(workoutsDone);
      } catch (error) {
        console.error("Error fetching workout history:", error);
      }
    };

    fetchWorkoutsDone();
  }, []);

  useEffect(() => {
    const userAvatar = user.avatar_url;
    const userCoins = user.coins;
    const userLevel = user.level;
    const userStreak = user.streak;

    if (userAvatar) setUserAvatar(userAvatar);
    if (userCoins) setCoins(userCoins);
    if (userLevel) setLevel(userLevel);
    if (userStreak) setStreak(userStreak);

    getNewQuote();
  }, [user]);

  const getNewQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    const newQuote = motivationalQuotes[randomIndex];
    setQuote(newQuote);
  };

  useEffect(() => {
    if (restMode && restTimeRemaining > 0 && !isRestPaused) {
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
  }, [restMode, restTimeRemaining, isRestPaused]);

  const handleRepsChange = (increment: boolean) => {
    if (currentExerciseIndex >= exercises.length) return;

    const updatedExercise = exercises[currentExerciseIndex];
    updatedExercise.currentReps = Math.max(
      0,
      increment
        ? updatedExercise.currentReps + 1
        : updatedExercise.currentReps - 1
    );

    setExercises((prevExercises) => {
      const newExercises = [...prevExercises];
      newExercises[currentExerciseIndex] = updatedExercise;

      return newExercises;
    });
  };

  // Update the startWorkout function to fetch from the API
  const startWorkout = async () => {
    setIsLoading(true);
    setError(null);

    if (currentWorkout === null) {
      const fetchedWorkout = await workoutService.getCurrentWorkout();

      setCurrentWorkout(fetchedWorkout);
      setOriginalWorkout(fetchedWorkout);
      const convertedExercises = convertApiWorkoutToUIFormat(fetchedWorkout);
      setExercises(convertedExercises);
      setCurrentWorkoutId(fetchedWorkout.id);
    } else {
      setOriginalWorkout(currentWorkout);
      const convertedExercises = convertApiWorkoutToUIFormat(currentWorkout);
      setExercises(convertedExercises);
      setCurrentWorkoutId(currentWorkout.id);
    }

    setCurrentExerciseIndex(0);
    setWorkoutStarted(true);
    setIsLoading(false);
  };

  // Update the submitSet function to use the API with the current workout
  const submitSet = async () => {
    if (currentExerciseIndex >= exercises.length || !originalWorkout) return;

    const exercise = exercises[currentExerciseIndex];

    if (exercise.currentSet >= exercise.targetSets) {
      setShowMaxSetsAlert(true);
      setTimeout(() => setShowMaxSetsAlert(false), 3000);
      return;
    }

    setIsLoading(true);

    try {
      // Get the current set
      const currentSet = exercise.sets[exercise.currentSet];

      // Update the set in the API
      if (currentWorkoutId && currentSet.id) {
        // Update the UI state first
        setExercises((prevExercises) => {
          const newExercises = [...prevExercises];
          const exercise = newExercises[currentExerciseIndex];

          const newSets = [...exercise.sets];
          newSets[exercise.currentSet] = {
            ...newSets[exercise.currentSet],
            completed: true,
            reps: exercise.currentReps,
          };

          newExercises[currentExerciseIndex] = {
            ...exercise,
            sets: newSets,
            currentSet: exercise.currentSet + 1,
            currentReps: 0,
          };

          return newExercises;
        });

        // Call the API with the current workout
        const updatedWorkout = updateSetUtils(
          originalWorkout,
          exercise.workoutExerciseId,
          currentSet.id,
          exercise.currentReps
        );

        // Update the original workout with the response
        setOriginalWorkout(updatedWorkout);
      }

      // Check if all sets for this exercise are completed
      const nextSetIndex = exercise.currentSet + 1;

      if (nextSetIndex >= exercise.targetSets) {
        // Exercise completed
        setShowExerciseComplete(true);
        setTimeout(() => {
          setShowExerciseComplete(false);
          // If there are more exercises, start rest timer
          if (currentExerciseIndex < exercises.length - 1) {
            setRestMode(true);
            setRestTimeRemaining(exercise.restTime);
            setIsRestPaused(false);
          }
        }, 500);
      } else {
        // Start rest timer between sets
        setRestMode(true);
        setRestTimeRemaining(exercise.restTime);
        setIsRestPaused(false);
      }
    } catch (err) {
      console.error("Error submitting set:", err);
      setError("Failed to save your progress. Please try again.");
    } finally {
      setIsLoading(false);
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

  const skipRest = () => {
    setRestMode(false);
    setIsRestPaused(false);
    if (
      exercises[currentExerciseIndex].currentSet >=
      exercises[currentExerciseIndex].targetSets
    ) {
      moveToNextExercise();
    }
  };

  const toggleRestPause = () => {
    setIsRestPaused(!isRestPaused);
  };

  const quitWorkout = () => {
    // Clear workout data and return to home
    localStorage.removeItem("currentWorkout");
    setExercises([]);
    setWorkoutStarted(false);
    setCurrentExerciseIndex(0);
    setRestMode(false);
    setIsRestPaused(false);
    setShowQuitDialog(false);
  };

  // Update the finishWorkout function to use the API with the current workout
  const finishWorkout = async () => {
    if (!currentWorkoutId || !originalWorkout) return;

    try {
      setIsLoading(true);

      // Finish the workout and receive rewards from the backend
      const { coins, experience_earned, score, newBadges } =
        await workoutService.finishWorkout(originalWorkout);

      // Save the completed workout to local storage
      // const completedExercises = exercises.map((exercise) => ({
      //   name: exercise.name,
      //   sets: exercise.sets,
      //   totalReps: exercise.sets.reduce(
      //     (total, set) => total + (set.reps || 0),
      //     0
      //   ),
      // }));

      setWorkoutsDone((prev) => prev + 1);

      // Update streak
      // setStreak(newStreak);
      // user.setUser({ streak: newStreak });

      // Update coins
      const newCoins = coins + (user.coins ?? 0);
      setCoins(newCoins);
      setEarnedCoins(coins);
      user.setUser({ coins: newCoins });

      // Update experience and level
      const currentXP = user.experience || 0;
      const newTotalXP = currentXP + experience_earned;
      setEarnedXP(experience_earned);
      user.setUser({ experience: newTotalXP });
      const newLevel = Math.floor(newTotalXP / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        user.setUser({ level: newLevel });
      }

      if (newBadges && Array.isArray(newBadges) && newBadges.length > 0) {
        const userBadges = user.user_badges || [];
        const newUserBadges = [...userBadges];

        newBadges.forEach(
          (badge: { id: number; name: string; icon: string }) => {
            if (!userBadges.some((b: { id: number }) => b.id === badge.id)) {
              newUserBadges.push({
                ...badge,
                description: "Badge earned",
                earnedAt: new Date().toISOString(),
              });
            }
          }
        );

        user.setUser({ user_badges: newUserBadges });
        setEarnedBadges(
          newBadges.map(
            (badge: { id: number; name: string; icon: string }) => ({
              ...badge,
              id: badge.id.toString(),
            })
          )
        );
      }

      setEarnedScore(score);

      setCurrentWorkout(null);
      setShowConfetti(true);
      setWorkoutStarted(false);
      setCurrentWorkoutId(null);
    } catch (err) {
      console.error("Error finishing workout:", err);
      setError("Failed to finish workout. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const currentExercise = exercises[currentExerciseIndex];

  const startDailyChallenge = async () => {
    if (isDailyChallengeDone) return;

    // Simulate progress update
    if (todaysChallenge?.intervals) {
      localStorage.setItem(
        DAILY_CHALLENGE_KEY,
        JSON.stringify(
          Math.min(
            dailyChallengeProgress + todaysChallenge.intervals,
            todaysChallenge.repetitions
          )
        )
      );
      setDailyChallengeProgress((prev) =>
        Math.min(prev + todaysChallenge.intervals, todaysChallenge.repetitions)
      );

      // If challenge is completed
      if (
        dailyChallengeProgress + todaysChallenge.intervals >=
        todaysChallenge.repetitions
      ) {
        setIsDailyChallengeDone(true);
        // Show celebration popup
        setShowChallengeComplete(true);
        setTimeout(() => {
          setShowChallengeComplete(false);
        }, 3000);

        await challengeService.finishChallenge(user.id);

        // Update coins, experience and level
        const newCoins = coins + 50;
        setCoins(newCoins);

        const currentXP = user.experience || 0;
        const newTotalXP = currentXP + 100;
        setEarnedXP(100);

        user.setUser({ coins: newCoins, experience: newTotalXP });

        const newLevel = Math.floor(newTotalXP / 100) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
          user.setUser({ level: newLevel });
        }
      }
    }
  };

  return (
    <>
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
                    {earnedScore} / 100
                  </p>
                  <div className="w-full bg-purple-200 h-2 rounded-full mt-2">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(Math.round(earnedXP / 2), 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {earnedBadges.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg mb-6">
                    <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-purple-600 mb-3">
                      Badges Earned
                    </p>
                    <div
                      className="grid grid-cols-4 gap-4 justify-center max-h-40 overflow-y-auto"
                      style={{ maxWidth: 450 }}
                    >
                      {earnedBadges.map((badge) => (
                        <motion.div
                          key={badge.id}
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: "spring",
                            delay: 0.3,
                            duration: 0.5,
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

        {error && (
          <Alert
            variant="destructive"
            className="mb-4 animate-in slide-in-from-top"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
            <AlertTitle className="text-green-800">
              Exercise Complete!
            </AlertTitle>
            <AlertDescription className="text-green-700">
              You've completed all sets for this exercise. Keep up the good
              work!
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
                      {workoutsDone}
                    </div>
                    <div className="text-xs text-purple-600">Workouts Done</div>
                  </div>
                  <div
                    className="p-4 text-center col-span-3 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                    onClick={startWorkout}
                  >
                    <div className="flex items-center justify-center gap-2 text-purple-700 font-medium">
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <PlayCircle className="w-5 h-5" />
                      )}
                      <span>
                        {isLoading
                          ? "Loading Workout..."
                          : "Start Today's Workout"}
                      </span>
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
                    {todaysChallenge?.description}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Earn bonus XP and coins by completing this challenge
                  </p>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${dailyChallengeProgress * 2}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {dailyChallengeProgress}/{todaysChallenge?.repetitions}{" "}
                    completed
                  </span>
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
                    ? `Challenge Completed! ✓`
                    : `Do ${todaysChallenge?.intervals} ${todaysChallenge?.exercise}`}
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
                {upcomingWorkout ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">Your Next Workout</h3>
                        <p className="text-sm text-muted-foreground">
                          Focus:{" "}
                          {upcomingWorkout.workout_exercises.length > 0
                            ? upcomingWorkout.workout_exercises
                                .map((we) => we.exercises?.muscle_group)
                                .filter(
                                  (group, index, arr) =>
                                    arr.indexOf(group) === index
                                )
                                .join(", ") || "Full Body"
                            : "Full Body"}
                        </p>
                      </div>
                      <div className="bg-purple-100 px-2 py-1 rounded text-xs font-medium text-purple-700">
                        {upcomingWorkout.workout_exercises.length} exercises
                      </div>
                    </div>
                    <div className="space-y-2">
                      {upcomingWorkout.workout_exercises.map(
                        (workoutExercise) => (
                          <div
                            key={workoutExercise.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Dumbbell className="h-4 w-4 text-purple-500" />
                            <span className="flex-1">
                              {workoutExercise.exercises?.name ||
                                "Unknown Exercise"}
                            </span>
                            <span className="text-xs text-purple-600">
                              {workoutExercise.exercise_templates
                                ?.target_sets || 3}{" "}
                              ×{" "}
                              {workoutExercise.exercise_templates
                                ?.target_reps || 10}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-purple-100">
                      <div className="text-xs text-purple-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Total Sets:</span>
                          <span className="font-medium">
                            {upcomingWorkout.workout_exercises.reduce(
                              (total, we) =>
                                total +
                                (we.exercise_templates?.target_sets || 0),
                              0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Est. Duration:</span>
                          <span className="font-medium">
                            {Math.ceil(
                              upcomingWorkout.workout_exercises.reduce(
                                (total, we) =>
                                  total +
                                  (we.exercise_templates?.target_sets || 0) *
                                    (we.exercise_templates?.rest_time_seconds ||
                                      60),
                                0
                              ) / 60
                            )}{" "}
                            min
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600 mr-2" />
                    <span className="text-purple-600">Loading workout...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="text-purple-800 font-medium">
                      Daily Quote
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={getNewQuote}
                      className="h-8 w-8 p-0 rounded-full text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M3 21v-5h5" />
                      </svg>
                      <span className="sr-only">Refresh Quote</span>
                    </Button>
                  </div>
                  <motion.p
                    key={quote}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-purple-700 italic"
                  >
                    "{quote}"
                  </motion.p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : restMode ? (
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-sm"
            >
              <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-white via-blue-50 to-purple-50">
                <CardContent className="p-8 text-center">
                  {/* Animated Clock Icon */}
                  <motion.div
                    className="relative mb-6 mx-auto w-24 h-24"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <Clock className="w-12 h-12 text-white" />
                    </div>
                    <motion.div
                      className="absolute inset-0 border-4 border-blue-300 rounded-full"
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      style={{
                        borderTopColor: "transparent",
                        borderRightColor: "transparent",
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 border-4 border-purple-300 rounded-full"
                      animate={{
                        rotate: -360,
                      }}
                      transition={{
                        duration: 6,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      style={{
                        borderBottomColor: "transparent",
                        borderLeftColor: "transparent",
                      }}
                    />
                  </motion.div>

                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Rest Time
                  </h2>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    {currentExercise.currentSet >= currentExercise.targetSets
                      ? "Great job! Take a breather before the next exercise"
                      : "Recover and prepare for your next set"}
                  </p>

                  {/* Circular Progress */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 mx-auto">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-blue-100"
                        />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="transparent"
                          strokeLinecap="round"
                          style={{
                            strokeDasharray: `${2 * Math.PI * 45}`,
                            strokeDashoffset: `${
                              2 *
                              Math.PI *
                              45 *
                              (1 -
                                restTimeRemaining /
                                  exercises[currentExerciseIndex].restTime)
                            }`,
                          }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="50%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#EC4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {formatTime(restTimeRemaining)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {isRestPaused ? "Paused" : "Remaining"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Button
                        onClick={toggleRestPause}
                        variant="outline"
                        className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                      >
                        {isRestPaused ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={skipRest}
                        className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        Skip Rest
                      </Button>
                    </div>

                    {/* Next Exercise Preview */}
                    {currentExercise.currentSet >= currentExercise.targetSets &&
                      currentExerciseIndex < exercises.length - 1 && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <p className="text-xs text-green-600 mb-1">
                            Next Exercise:
                          </p>
                          <p className="font-medium text-green-800 text-sm">
                            {exercises[currentExerciseIndex + 1].name}
                          </p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
                <Button
                  onClick={() => setShowQuitDialog(true)}
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full border-red-200 hover:border-red-300"
                  title="Exit workout"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </Button>
              </div>
              <div className="w-full bg-purple-200 h-2 rounded-full">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{
                    width: `${
                      ((currentExerciseIndex + 1) / exercises.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={moveToPreviousExercise}
                disabled={currentExerciseIndex === 0 || isLoading}
                className="text-purple-600 border-purple-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={moveToNextExercise}
                disabled={
                  currentExerciseIndex === exercises.length - 1 || isLoading
                }
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>Complete Set {currentExercise.currentSet + 1}</>
                          )}
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

            <div className="flex gap-4 mb-8 justify-center">
              <Button
                onClick={finishWorkout}
                className={cn(
                  "w-full max-w-xs py-4 px-6 rounded-full font-bold text-lg shadow-lg transition-all duration-200 ease-in-out transform",
                  "bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500",
                  "hover:from-purple-700 hover:via-indigo-600 hover:to-pink-600",
                  "text-white border-2 border-purple-300 hover:border-purple-400",
                  "hover:scale-105 focus:ring-4 focus:ring-purple-200"
                )}
                disabled={isLoading}
                style={{
                  letterSpacing: "0.03em",
                  boxShadow: "0 4px 24px 0 rgba(139, 92, 246, 0.15)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Saving Workout...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎉</span>
                    Finish Workout
                  </>
                )}
              </Button>
            </div>
          </>
        )}
        <Dialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
          <DialogContent className="max-w-[280px] mx-auto rounded-2xl border-none shadow-2xl">
            <DialogHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-800 mb-2">
                Exit Workout?
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm">
                Progress won't be saved
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-row gap-3 pt-4 justify-center">
              <Button
                variant="outline"
                onClick={() => setShowQuitDialog(false)}
                className="border-gray-300 hover:bg-gray-50 px-6"
              >
                Resume
              </Button>
              <Button
                onClick={quitWorkout}
                className="bg-red-500 hover:bg-red-600 text-white px-6"
              >
                Exit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
      {!workoutStarted && <Navigation />}
    </>
  );
}
