import { useState } from "react";
import { Dumbbell } from "lucide-react";

interface FallbackExerciseImageProps {
  exerciseName: string;
  className?: string;
}

export default function FallbackExerciseImage({
  exerciseName,
  className = ""
}: FallbackExerciseImageProps) {
  const [imageError, setImageError] = useState(false);

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

  // Try to load a placeholder image first
  const placeholderUrl = `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(
    exerciseName
  )}`;

  if (imageError) {
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
      <img
        src={placeholderUrl || "/placeholder.svg"}
        alt={exerciseName}
        width={400}
        height={200}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
