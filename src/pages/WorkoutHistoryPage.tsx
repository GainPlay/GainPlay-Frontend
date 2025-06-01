import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ArrowLeft,
  ChevronRight,
  BarChart,
  CalendarIcon,
  Dumbbell,
  Clock,
  Award,
  TrendingUp,
  FlameIcon as Fire,
  ChevronLeft,
  Filter,
  Check
} from "lucide-react";
import {
  format,
  parseISO,
  isAfter,
  isBefore,
  subDays,
  subMonths,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isWithinInterval,
  eachDayOfInterval,
  isSameDay,
  getWeek
} from "date-fns";
import FallbackExerciseImage from "../components/FallbackExerciseImage";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { workoutService } from "@/services/workoutService";

type WorkoutHistoryItem = {
  date: string;
  exercises: {
    name: string;
    sets: { completed: boolean; reps: number }[];
    totalReps: number;
  }[];
};

export default function WorkoutHistoryPage() {
  const navigate = useNavigate();
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>(
    []
  );
  const [filteredHistory, setFilteredHistory] = useState<WorkoutHistoryItem[]>(
    []
  );
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedWorkout, setSelectedWorkout] =
    useState<WorkoutHistoryItem | null>(null);

  // For week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date())
  );
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<WorkoutHistoryItem[]>(
    []
  );

  // For progress graph navigation
  const [progressGraphWeekStart, setProgressGraphWeekStart] = useState(
    startOfWeek(new Date())
  );

  useEffect(() => {
    const fetchAndSetHistory = async () => {
      const workoutHistory = await fetchWorkoutHistory();
      if (workoutHistory.length) {
        setWorkoutHistory(workoutHistory);
        setFilteredHistory(workoutHistory);
      }
    };

    fetchAndSetHistory();
  }, []);

  useEffect(() => {
    let filtered = workoutHistory;

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date();
      let filterDate: string | number | Date;

      switch (dateFilter) {
        case "7":
          filterDate = subDays(today, 7);
          break;
        case "30":
          filterDate = subDays(today, 30);
          break;
        case "90":
          filterDate = subDays(today, 90);
          break;
        case "this-month":
          filterDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case "last-month": {
          filterDate = subMonths(today, 1);
          const lastMonthEnd = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
          );
          filtered = filtered.filter(
            (workout) =>
              isAfter(parseISO(workout.date), filterDate) &&
              isBefore(parseISO(workout.date), lastMonthEnd)
          );
          break;
        }
        default:
          filterDate = subDays(today, Number.parseInt(dateFilter));
      }

      if (dateFilter !== "last-month") {
        filtered = filtered.filter(
          (workout) =>
            isAfter(parseISO(workout.date), filterDate) &&
            isBefore(parseISO(workout.date), today)
        );
      }
    }

    setFilteredHistory(filtered);
  }, [workoutHistory, dateFilter]);

  // Update weekly workouts when currentWeekStart changes
  useEffect(() => {
    const weekEnd = endOfWeek(currentWeekStart);

    const workoutsInWeek = workoutHistory.filter((workout) => {
      const workoutDate = parseISO(workout.date);
      return isWithinInterval(workoutDate, {
        start: currentWeekStart,
        end: weekEnd
      });
    });

    setWeeklyWorkouts(workoutsInWeek);
  }, [currentWeekStart, workoutHistory]);

  const getTotalReps = (workout: WorkoutHistoryItem) =>
    workout.exercises.reduce(
      (total, exercise) => total + exercise.totalReps,
      0
    );

  const viewWorkoutDetails = (workout: WorkoutHistoryItem) => {
    setSelectedWorkout(workout);
    setActiveTab("details");
  };

  // Navigate to previous/next week
  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekStart((prev) =>
      direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  // Navigate through weeks in the progress graph
  const navigateProgressGraph = (direction: "prev" | "next") => {
    setProgressGraphWeekStart((prev) =>
      direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  // Calculate performance metrics
  const calculatePerformanceMetrics = () => {
    if (filteredHistory.length === 0)
      return {
        totalWorkouts: 0,
        totalReps: 0,
        avgRepsPerWorkout: 0,
        streak: 0
      };

    const totalWorkouts = filteredHistory.length;
    const totalReps = filteredHistory.reduce(
      (sum, workout) => sum + getTotalReps(workout),
      0
    );
    const avgRepsPerWorkout = Math.round(totalReps / totalWorkouts);

    // Calculate streak
    let streak = 0;
    const sortedDates = [...filteredHistory]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((workout) => workout.date);

    if (sortedDates.length > 0) {
      let currentDate = new Date(sortedDates[0]);
      const today = new Date();

      // If the most recent workout was today or yesterday, start counting streak
      if (differenceInDays(today, currentDate) <= 1) {
        streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i]);
          if (differenceInDays(currentDate, prevDate) === 1) {
            streak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    return { totalWorkouts, totalReps, avgRepsPerWorkout, streak };
  };

  const metrics = calculatePerformanceMetrics();

  // Get top exercises by total reps
  const getTopExercises = () => {
    const exerciseTotals: { [key: string]: number } = {};

    filteredHistory.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        if (!exerciseTotals[exercise.name]) {
          exerciseTotals[exercise.name] = 0;
        }
        exerciseTotals[exercise.name] += exercise.totalReps;
      });
    });

    return Object.entries(exerciseTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, reps]) => ({ name, reps }));
  };

  const topExercises = getTopExercises();

  // Generate mock workout history data
  async function fetchWorkoutHistory(): Promise<WorkoutHistoryItem[]> {
    const history: WorkoutHistoryItem[] =
      await workoutService.getWorkoutHistory();

    return history;
  }

  // Get workouts for the progress graph week
  const getProgressGraphData = () => {
    const weekEnd = endOfWeek(progressGraphWeekStart);
    const daysInWeek = eachDayOfInterval({
      start: progressGraphWeekStart,
      end: weekEnd
    });

    // Create data for each day of the week
    return daysInWeek.map((day) => {
      // Find workout for this day if it exists
      const workout = workoutHistory.find((w) =>
        isSameDay(parseISO(w.date), day)
      );

      return {
        date: day,
        totalReps: workout ? getTotalReps(workout) : 0,
        hasWorkout: !!workout
      };
    });
  };

  const progressData = getProgressGraphData();

  return (
    <div className="flex flex-col min-h-screen bg-purple-100 p-4 pb-20">
      <header className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="mr-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800">Workout History</h1>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 w-full bg-purple-50">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white"
          >
            <BarChart className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">History</span>
            <span className="sm:hidden">Log</span>
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-white"
            disabled={!selectedWorkout}
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Details</span>
            <span className="sm:hidden">View</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-600" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-purple-600 mb-1">
                      Total Workouts
                    </p>
                    <p className="text-3xl font-bold text-purple-800">
                      {metrics.totalWorkouts}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-purple-600 mb-1">
                      Current Streak
                    </p>
                    <p className="text-3xl font-bold text-purple-800">
                      {metrics.streak}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-purple-600 mb-1">Total Reps</p>
                    <p className="text-3xl font-bold text-purple-800">
                      {metrics.totalReps}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-purple-600 mb-1">Avg Reps</p>
                    <p className="text-3xl font-bold text-purple-800">
                      {metrics.avgRepsPerWorkout}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Fire className="w-5 h-5 mr-2 text-orange-500" />
                  Top Exercises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topExercises.map((exercise, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <span className="font-bold text-purple-700">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-purple-900 truncate">
                          {exercise.name}
                        </p>
                        <div className="w-full bg-purple-100 h-2 rounded-full mt-1">
                          <div
                            className="bg-purple-600 h-full rounded-full"
                            style={{
                              width: `${
                                (exercise.reps / topExercises[0].reps) * 100
                              }%`
                            }}
                          ></div>
                        </div>
                      </div>
                      <p className="ml-3 font-semibold text-purple-700 whitespace-nowrap">
                        {exercise.reps} reps
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Progress Over Time
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-purple-600"
                    onClick={() => navigateProgressGraph("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-purple-600"
                    onClick={() => navigateProgressGraph("next")}
                    disabled={isAfter(
                      endOfWeek(progressGraphWeekStart),
                      new Date()
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Week {getWeek(progressGraphWeekStart)}:{" "}
                {format(progressGraphWeekStart, "MMM d")} -{" "}
                {format(endOfWeek(progressGraphWeekStart), "MMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-60 flex items-end justify-between overflow-x-auto pb-2">
                <div className="flex items-end space-x-2 sm:space-x-4 min-w-full justify-around">
                  {progressData.map((day, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1 min-w-[40px] max-w-[80px]"
                    >
                      <div
                        className={`w-full max-w-[60px] rounded-t-md transition-all duration-300 ease-in-out relative group ${
                          day.hasWorkout
                            ? "bg-purple-600 hover:bg-purple-500"
                            : "bg-purple-200"
                        }`}
                        style={{
                          height: `${Math.max(5, day.totalReps / 2)}px`
                        }}
                      >
                        {day.hasWorkout && (
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-purple-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {day.totalReps} reps
                          </div>
                        )}
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-xs font-semibold block">
                          {format(day.date, "EEE")}
                        </span>
                        <span className="text-xs text-purple-600 block">
                          {format(day.date, "MMM d")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Weekly Workouts
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-purple-600"
                    onClick={() => navigateWeek("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-purple-600"
                    onClick={() => navigateWeek("next")}
                    disabled={isAfter(endOfWeek(currentWeekStart), new Date())}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {format(currentWeekStart, "MMM d")} -{" "}
                {format(endOfWeek(currentWeekStart), "MMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {weeklyWorkouts.map((workout, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-purple-500"
                      onClick={() => viewWorkoutDetails(workout)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                              <span className="font-bold text-purple-700">
                                {format(parseISO(workout.date), "dd")}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-purple-800">
                                {format(parseISO(workout.date), "EEEE")}
                              </h3>
                              <p className="text-sm text-purple-600">
                                {workout.exercises.length} exercises
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-right mr-3">
                              <span className="font-semibold text-purple-700">
                                {getTotalReps(workout)}
                              </span>
                              <p className="text-xs text-purple-600">
                                total reps
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-purple-400" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-purple-50 rounded-lg">
                  <Calendar className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-purple-800 mb-1">
                    No Workouts This Week
                  </h3>
                  <p className="text-purple-600">
                    You don't have any workouts recorded for this week.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <Card className="mb-6 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Filter className="w-5 h-5 mr-2 text-purple-600" />
                Filter Workouts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between border-purple-200 text-purple-700"
                  >
                    {dateFilter === "all" && "All Time"}
                    {dateFilter === "7" && "Last 7 Days"}
                    {dateFilter === "30" && "Last 30 Days"}
                    {dateFilter === "90" && "Last 90 Days"}
                    {dateFilter === "this-month" && "This Month"}
                    {dateFilter === "last-month" && "Last Month"}
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <div className="p-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={() => setDateFilter("all")}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          dateFilter === "all" ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      All Time
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={() => setDateFilter("7")}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          dateFilter === "7" ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      Last 7 Days
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={() => setDateFilter("30")}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          dateFilter === "30" ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      Last 30 Days
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={() => setDateFilter("90")}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          dateFilter === "90" ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      Last 90 Days
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={() => setDateFilter("this-month")}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          dateFilter === "this-month"
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      This Month
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={() => setDateFilter("last-month")}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          dateFilter === "last-month"
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      Last Month
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge
                  variant={dateFilter === "all" ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setDateFilter("all")}
                >
                  All Time
                </Badge>
                <Badge
                  variant={dateFilter === "7" ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setDateFilter("7")}
                >
                  Last 7 Days
                </Badge>
                <Badge
                  variant={dateFilter === "30" ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setDateFilter("30")}
                >
                  Last 30 Days
                </Badge>
                <Badge
                  variant={dateFilter === "90" ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setDateFilter("90")}
                >
                  Last 90 Days
                </Badge>
                <Badge
                  variant={dateFilter === "this-month" ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setDateFilter("this-month")}
                >
                  This Month
                </Badge>
                <Badge
                  variant={dateFilter === "last-month" ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setDateFilter("last-month")}
                >
                  Last Month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filteredHistory.map((workout, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => viewWorkoutDetails(workout)}
              >
                <div className="p-4 flex justify-between items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center">
                      <CalendarIcon className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0" />
                      <h3 className="font-semibold text-purple-800 truncate">
                        {format(parseISO(workout.date), "EEE, MMM d")}
                      </h3>
                    </div>
                    <p className="text-sm text-purple-600 mt-1 truncate">
                      {workout.exercises.length} exercises •{" "}
                      {getTotalReps(workout)} total reps
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0 ml-2" />
                </div>
              </Card>
            ))}

            {filteredHistory.length === 0 && (
              <div className="text-center p-8 bg-white rounded-lg border">
                <Calendar className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-purple-800 mb-1">
                  No Workouts Found
                </h3>
                <p className="text-purple-600">
                  No workouts found for the selected time period.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mt-4">
          {selectedWorkout && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2 text-purple-600" />
                      <span className="truncate">
                        Workout on{" "}
                        {format(parseISO(selectedWorkout.date), "EEEE, MMMM d")}
                      </span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("history")}
                      className="text-purple-600"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Back</span>
                    </Button>
                  </div>
                  <CardDescription>
                    {selectedWorkout.exercises.length} exercises •{" "}
                    {getTotalReps(selectedWorkout)} total reps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <Badge className="bg-purple-100 text-purple-700">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(parseISO(selectedWorkout.date), "h:mm a")}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700">
                      <Award className="w-3 h-3 mr-1" />
                      Score: {Math.round(getTotalReps(selectedWorkout) * 1.5)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedWorkout.exercises.map((exercise, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="h-32 bg-purple-50">
                          <FallbackExerciseImage
                            exerciseName={exercise.name}
                            className="h-32"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-purple-800 mb-2 truncate">
                            {exercise.name}
                          </h3>

                          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                            <div className="text-sm text-purple-600">
                              {exercise.sets.length} sets • {exercise.totalReps}{" "}
                              total reps
                            </div>
                            <Badge className="bg-purple-100 text-purple-700">
                              {Math.round(
                                exercise.totalReps / exercise.sets.length
                              )}{" "}
                              avg/set
                            </Badge>
                          </div>

                          <div className="grid grid-cols-5 gap-2">
                            {exercise.sets.map((set, setIndex) => (
                              <div
                                key={setIndex}
                                className="text-center p-2 rounded bg-purple-100"
                              >
                                <div className="text-xs font-medium">
                                  Set {setIndex + 1}
                                </div>
                                <div className="text-sm font-semibold">
                                  {set.reps}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
