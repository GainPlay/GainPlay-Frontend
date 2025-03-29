import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { Slider } from "../components/ui/slider";
import { onboardingQuestions } from "../data/mockData";

const questions = onboardingQuestions;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(5));

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Save answers and redirect to home page
      localStorage.setItem(
        "userGoals",
        JSON.stringify({
          "Gain Muscle": answers[0],
          "Improve Flexibility": answers[1],
          "Increase Stamina": answers[2],
          "Exercise Frequency": answers[3],
          "Current Fitness Level": answers[4]
        })
      );
      navigate("/home");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-purple-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-purple-800">
            Let's Get to Know You!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl mb-4 text-purple-700">
            {questions[currentQuestion]}
          </h2>
          <Slider
            value={[answers[currentQuestion]]}
            onValueChange={(value) => {
              const newAnswers = [...answers];
              newAnswers[currentQuestion] = value[0];
              setAnswers(newAnswers);
            }}
            max={10}
            step={1}
            className="mb-6"
          />
          <div className="flex justify-between text-sm text-purple-600 mb-6">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
          <Button
            onClick={handleNext}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}