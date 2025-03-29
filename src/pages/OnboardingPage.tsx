import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Slider } from "../components/ui/slider";
import { Goal, UserGoal } from "@/types";
import { workoutService } from "@/services/workoutService";
import { userService } from "@/services/userService";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentGoal, setCurrentGoal] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserGoal>[]>([]);

  useEffect(() => {
    const fetchGoals = async (): Promise<void> => {
      const fetchedGoals = await workoutService.getGoals();
      setGoals(fetchedGoals);
    };
    fetchGoals();
  }, []);

  const handleNext = async () => {
    if (currentGoal < goals.length - 1) {
      setCurrentGoal(currentGoal + 1);
    } else {
      await userService.saveUserGoals(answers);
      navigate("/home");
    }
  };

  const handleAnswer = (value: number[]) => {
    const newAnswers = [...answers];
    newAnswers[currentGoal] = { goalId: goals[currentGoal].id, name:goals[currentGoal].name, value: value[0] };
    setAnswers(newAnswers);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-purple-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-purple-800">Let's Get to Know You!</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl mb-4 text-purple-700">{goals[currentGoal]?.description}</h2>
          <Slider
            value={[answers[currentGoal]?.value || 0]}
            onValueChange={handleAnswer}
            max={10}
            step={1}
            className="mb-6"
          />
          <div className="flex justify-between text-sm text-purple-600 mb-6">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
          <Button onClick={handleNext} className="w-full bg-purple-600 hover:bg-purple-700">
            {currentGoal < goals.length - 1 ? "Next" : "Finish"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
