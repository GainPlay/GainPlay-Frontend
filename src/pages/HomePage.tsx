import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import {
  Flame,
  Trophy,
  Plus,
  Minus,
  Check,
  PlayCircle,
  AlertCircle,
  BarChart,
  ShoppingCart,
  Coins,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import type { Exercise, UserData } from "../types";
import { userService } from "../services/userService";
import { workoutService } from "../services/workoutService";

interface HomePageProps {
  userData: UserData;
  updateUserData: (newData: Partial<UserData>) => void;
}

// eslint-disable-next-line no-empty-pattern
export default function HomePage({}: HomePageProps) {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showMaxSetsAlert, setShowMaxSetsAlert] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");
  const [coins, setCoins] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(
    null
  );
  const [, setWindowDimensions] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const userData = await userService.getUserData();
      setUserAvatar(userData.avatar);
      setCoins(userData.coins);

      const currentWorkout = await workoutService.getCurrentWorkout();
      if (currentWorkout.length > 0) {
        setExercises(currentWorkout);
      }

      const storedWorkoutStarted = localStorage.getItem("workoutStarted");
      if (storedWorkoutStarted) {
        setWorkoutStarted(JSON.parse(storedWorkoutStarted));
      }

      const storedActiveExerciseIndex = localStorage.getItem(
        "activeExerciseIndex"
      );
      if (storedActiveExerciseIndex) {
        setActiveExerciseIndex(Number.parseInt(storedActiveExerciseIndex));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (exercises.length > 0) {
      workoutService.saveCurrentWorkout(exercises);
    }
    localStorage.setItem("workoutStarted", JSON.stringify(workoutStarted));
    localStorage.setItem(
      "activeExerciseIndex",
      activeExerciseIndex !== null ? activeExerciseIndex.toString() : ""
    );
  }, [exercises, workoutStarted, activeExerciseIndex]);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set initial dimensions
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRepsChange = (exerciseIndex: number, increment: boolean) => {
    setExercises((prevExercises) => {
      const newExercises = [...prevExercises];
      const exercise = newExercises[exerciseIndex];
      exercise.currentReps = Math.max(
        0,
        increment ? exercise.currentReps + 1 : exercise.currentReps - 1
      );
      return newExercises;
    });
  };

  const submitSet = (exerciseIndex: number) => {
    setExercises((prevExercises) => {
      const newExercises = [...prevExercises];
      const exercise = newExercises[exerciseIndex];

      if (exercise.currentSet >= 5) {
        setShowMaxSetsAlert(true);
        setTimeout(() => setShowMaxSetsAlert(false), 3000);
        return newExercises;
      }

      const newSets = [...exercise.sets];
      newSets[exercise.currentSet] = {
        completed: true,
        reps: exercise.currentReps
      };

      newExercises[exerciseIndex] = {
        ...exercise,
        sets: newSets,
        currentSet: exercise.currentSet + 1,
        currentReps: 0
      };

      return newExercises;
    });
  };

  const startWorkout = async () => {
    const currentWorkout = await workoutService.getCurrentWorkout();
    setExercises(currentWorkout);
    setWorkoutStarted(true);
    localStorage.setItem("workoutStarted", JSON.stringify(true));
  };

  const finishWorkout = async () => {
    const earnedCoins = await workoutService.finishWorkout(exercises);
    setEarnedCoins(earnedCoins);
    setShowConfetti(true);
    setWorkoutStarted(false);
    setActiveExerciseIndex(null);

    const userData = await userService.getUserData();
    setCoins(userData.coins);

    // Initialize exercises for the next workout
    const newExercises = await workoutService.getCurrentWorkout();
    setExercises(newExercises);
  };

  const closePopup = () => {
    setShowConfetti(false);
    setExercises([]);
  };

  const toggleExercise = (index: number) => {
    setActiveExerciseIndex(activeExerciseIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-purple-100 p-4 pb-20">
      {showConfetti && (
        <>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg text-center">
              <h2 className="text-3xl font-bold text-purple-800 mb-4">
                Workout Complete!
              </h2>
              <p className="text-xl text-purple-600 mb-4">You earned:</p>
              <div className="flex items-center justify-center text-4xl font-bold text-yellow-500 mb-6">
                <Coins className="w-12 h-12 mr-2" />
                {earnedCoins}
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => navigate("/workout-history")}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  View Workout History
                </Button>
                <Button
                  onClick={closePopup}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-100"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <header className="flex justify-between items-center mb-6">
        <img
          src={
            userAvatar ||
            "https://api.dicebear.com/6.x/avataaars/svg?seed=default"
          }
          alt="User Avatar"
          width={60}
          height={60}
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-purple-800">GainPlay</h1>
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/cart")}
            className="mr-2"
          >
            <ShoppingCart className="w-6 h-6 text-purple-600" />
          </Button>
          <div className="flex items-center">
            <Coins className="w-5 h-5 mr-1 text-yellow-500" />
            <span className="font-bold text-purple-600">{coins}</span>
          </div>
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
            You've reached the maximum of 5 sets for this exercise. Great work!
            💪
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-purple-700">Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div className="flex items-center">
              <Flame className="text-orange-500 mr-2" />
              <span>7 day streak</span>
            </div>
            <div className="flex items-center">
              <Trophy className="text-yellow-500 mr-2" />
              <span>Level 5</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {!workoutStarted ? (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <PlayCircle className="w-16 h-16 text-purple-600 mb-4" />
            <h2 className="text-2xl font-bold text-purple-800 mb-2">
              Ready to crush your workout?
            </h2>
            <p className="text-purple-600 mb-4">
              Your personalized exercise plan is all set. Let's get those gains!
            </p>
            <Button
              onClick={startWorkout}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              Start My Workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-purple-700">Today's Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {exercises.map((exercise, exerciseIndex) => (
                  <li key={exerciseIndex} className="border rounded-lg p-4">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleExercise(exerciseIndex)}
                    >
                      <span className="font-medium">{exercise.name}</span>
                      <Button variant="ghost" size="sm">
                        {activeExerciseIndex === exerciseIndex ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </Button>
                    </div>

                    {activeExerciseIndex === exerciseIndex && (
                      <div className="mt-4">
                        <div className="mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">
                              Set {exercise.currentSet + 1} of{" "}
                              {exercise.targetSets}
                            </span>
                            <span className="text-sm text-purple-600">
                              {
                                exercise.sets.filter((set) => set.completed)
                                  .length
                              }{" "}
                              sets completed
                            </span>
                          </div>
                          <Progress
                            value={
                              (exercise.currentSet / exercise.targetSets) * 100
                            }
                            className="h-2"
                          />
                        </div>

                        {exercise.currentSet < exercise.targetSets ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center gap-4">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleRepsChange(exerciseIndex, false)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="text-2xl font-bold min-w-[3ch] text-center">
                                {exercise.currentReps}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleRepsChange(exerciseIndex, true)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              className="w-full bg-purple-600 hover:bg-purple-700"
                              onClick={() => submitSet(exerciseIndex)}
                            >
                              Complete Set {exercise.currentSet + 1}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
                            <p className="text-sm font-medium">
                              All sets completed! 🎉
                            </p>
                          </div>
                        )}

                        <div className="mt-4 grid grid-cols-5 gap-2">
                          {exercise.sets.map((set, setIndex) => (
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
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Button
            onClick={finishWorkout}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 mb-4"
          >
            Finish Workout
          </Button>
        </>
      )}

      <Button
        onClick={() => navigate("/workout-history")}
        variant="outline"
        className="w-full text-purple-600 border-purple-600 hover:bg-purple-100"
      >
        <BarChart className="w-4 h-4 mr-2" />
        View Workout History
      </Button>
    </div>
  );
}
