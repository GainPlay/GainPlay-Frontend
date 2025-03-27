import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import {
  Calendar,
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Dumbbell
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, subDays } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "../components/ui/collapsible";
import { ScrollArea } from "../components/ui/scroll-area";
import { workoutService } from "../services/workoutService";
import type { UserData } from "../types";

type WorkoutHistoryItem = {
  date: string;
  exercises: {
    name: string;
    sets: { completed: boolean; reps: number }[];
    totalReps: number;
  }[];
};

interface WorkoutHistoryPageProps {
  userData: UserData;
  updateUserData: (newData: Partial<UserData>) => void;
}

export default function WorkoutHistoryPage({
  userData,
  updateUserData
}: WorkoutHistoryPageProps) {
  const navigate = useNavigate();
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>(
    []
  );
  const [filteredHistory, setFilteredHistory] = useState<WorkoutHistoryItem[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedWorkouts, setExpandedWorkouts] = useState<string[]>([]);
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);

  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      const history = await workoutService.getWorkoutHistory();
      setWorkoutHistory(history);
      setFilteredHistory(history);
    };
    fetchWorkoutHistory();
  }, []);

  useEffect(() => {
    let filtered = workoutHistory;

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date();
      const filterDate = subDays(today, Number.parseInt(dateFilter));
      filtered = filtered.filter(
        (workout) =>
          isAfter(parseISO(workout.date), filterDate) &&
          isBefore(parseISO(workout.date), today)
      );
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter((workout) =>
        workout.exercises.some((exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredHistory(filtered);
  }, [workoutHistory, searchTerm, dateFilter]);

  const getTotalReps = (workout: WorkoutHistoryItem) =>
    workout.exercises.reduce(
      (total, exercise) => total + exercise.totalReps,
      0
    );

  const toggleWorkoutExpansion = (workoutDate: string) => {
    setExpandedWorkouts((prev) =>
      prev.includes(workoutDate)
        ? prev.filter((d) => d !== workoutDate)
        : [...prev, workoutDate]
    );
  };

  const toggleExerciseExpansion = (
    workoutDate: string,
    exerciseName: string
  ) => {
    const key = `${workoutDate}-${exerciseName}`;
    setExpandedExercises((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-purple-700">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-purple-600" />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-purple-700">Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-end justify-between">
            {filteredHistory.slice(-7).map((workout, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="bg-purple-600 w-16 rounded-t-md transition-all duration-300 ease-in-out hover:bg-purple-500"
                  style={{
                    height: `${Math.max(
                      40,
                      (getTotalReps(workout) / 100) * 200
                    )}px`
                  }}
                ></div>
                <span className="text-xs mt-1 font-semibold">
                  {format(parseISO(workout.date), "MM/dd")}
                </span>
                <span className="text-xs text-purple-600">
                  {getTotalReps(workout)} reps
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[calc(100vh-24rem)] pr-4">
        <div className="space-y-4">
          {filteredHistory.map((workout, index) => (
            <Collapsible
              key={index}
              open={expandedWorkouts.includes(workout.date)}
            >
              <Card className="overflow-hidden transition-all duration-200 ease-in-out hover:shadow-md">
                <CollapsibleTrigger asChild>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => toggleWorkoutExpansion(workout.date)}
                  >
                    <CardTitle className="text-purple-700 flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        <span>
                          {format(parseISO(workout.date), "MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-normal mr-2">
                          Total Reps: {getTotalReps(workout)}
                        </span>
                        {expandedWorkouts.includes(workout.date) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <ul className="space-y-2">
                      {workout.exercises.map((exercise, exerciseIndex) => {
                        const exerciseKey = `${workout.date}-${exercise.name}`;
                        const isExpanded =
                          expandedExercises.includes(exerciseKey);
                        return (
                          <li
                            key={exerciseIndex}
                            className="rounded-md bg-purple-50 overflow-hidden"
                          >
                            <div
                              className="flex justify-between items-center p-2 cursor-pointer hover:bg-purple-100 transition-colors duration-200"
                              onClick={() =>
                                toggleExerciseExpansion(
                                  workout.date,
                                  exercise.name
                                )
                              }
                            >
                              <div className="flex items-center">
                                <Dumbbell className="w-4 h-4 mr-2 text-purple-600" />
                                <span>{exercise.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm text-purple-600 mr-2">
                                  {exercise.totalReps} reps
                                </span>
                                <span className="text-xs text-gray-500">
                                  (
                                  {
                                    exercise.sets.filter((set) => set.completed)
                                      .length
                                  }
                                  /{exercise.sets.length} sets)
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 ml-2" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 ml-2" />
                                )}
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="bg-white p-2">
                                <ul className="space-y-1">
                                  {exercise.sets.map((set, setIndex) => (
                                    <li key={setIndex} className="text-sm">
                                      Set {setIndex + 1}:{" "}
                                      {set.completed
                                        ? `${set.reps} reps`
                                        : "Not completed"}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
