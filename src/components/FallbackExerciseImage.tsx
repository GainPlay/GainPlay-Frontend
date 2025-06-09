import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface FallbackExerciseImageProps {
  exerciseName: string;
  className?: string;
}

export default function FallbackExerciseImage({
  exerciseName,
  className = ""
}: FallbackExerciseImageProps) {
  const [lottieError, setLottieError] = useState(false);

  // Generate a unique but consistent color based on exercise name
  const getColorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };
  const bgColor = getColorFromString(exerciseName);

  // Lottie animation path based on exercise name
  const lottiePath = `/lottie/${exerciseName}.lottie`;

  if (lottieError) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${className}`}
        style={{ backgroundColor: bgColor }}
      >
        <Dumbbell className="h-16 w-16 text-purple-600 mb-2" />
        <p className="text-purple-800 font-medium text-center px-4">
          {exerciseName}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {exerciseName ? (
        <DotLottieReact
          src={lottiePath}
          loop
          autoplay
          className="w-full h-full object-cover"
          onError={() => setLottieError(true)}
        />
      ) : (
        <div
          className={`flex flex-col items-center justify-center h-full w-full`}
          style={{ backgroundColor: bgColor || "hsl(240, 70%, 80%)" }}
        >
          <Dumbbell className="h-16 w-16 text-purple-600 mb-2" />
          <p className="text-purple-800 font-medium text-center px-4">
            Exercise
          </p>
        </div>
      )}
    </div>
  );
}
