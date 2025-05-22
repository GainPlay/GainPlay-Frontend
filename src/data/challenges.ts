type Challenge = {
  id: number;
  description: string;
  exercise: string;
  repetitions: number;
  intervals: number;
};

const challenges: Challenge[] = [
  {
    id: 1,
    description: "Complete 50 Push-ups Today",
    exercise: "Push-ups",
    repetitions: 50,
    intervals: 5,
  },
  {
    id: 2,
    description: "Do 100 Jumping Jacks",
    exercise: "Jumping Jacks",
    repetitions: 100,
    intervals: 4,
  },
  {
    id: 3,
    description: "Perform 60 Squats",
    exercise: "Squats",
    repetitions: 60,
    intervals: 6,
  },
  {
    id: 4,
    description: "Hold a 3-Minute Plank",
    exercise: "Plank",
    repetitions: 3,
    intervals: 1,
  },
  {
    id: 5,
    description: "Do 40 Sit-ups",
    exercise: "Sit-ups",
    repetitions: 40,
    intervals: 4,
  },
  {
    id: 6,
    description: "Complete 30 Burpees",
    exercise: "Burpees",
    repetitions: 30,
    intervals: 3,
  },
  {
    id: 7,
    description: "Run in Place for 10 Minutes",
    exercise: "Running in Place",
    repetitions: 10,
    intervals: 1,
  },
  {
    id: 8,
    description: "Perform 70 High Knees",
    exercise: "High Knees",
    repetitions: 70,
    intervals: 4,
  },
  {
    id: 9,
    description: "Do 45 Mountain Climbers",
    exercise: "Mountain Climbers",
    repetitions: 45,
    intervals: 3,
  },
  {
    id: 10,
    description: "Complete 35 Lunges",
    exercise: "Lunges",
    repetitions: 35,
    intervals: 3,
  },
  {
    id: 11,
    description: "Hold Wall Sit for 2 Minutes",
    exercise: "Wall Sit",
    repetitions: 2,
    intervals: 1,
  },
  {
    id: 12,
    description: "Perform 80 Arm Circles",
    exercise: "Arm Circles",
    repetitions: 80,
    intervals: 4,
  },
  {
    id: 13,
    description: "Do 25 Leg Raises",
    exercise: "Leg Raises",
    repetitions: 25,
    intervals: 2,
  },
  {
    id: 14,
    description: "Complete 20 Tricep Dips",
    exercise: "Tricep Dips",
    repetitions: 20,
    intervals: 2,
  },
  {
    id: 15,
    description: "Do 15 Pull-ups",
    exercise: "Pull-ups",
    repetitions: 15,
    intervals: 3,
  },
  {
    id: 16,
    description: "Hold Boat Pose for 1 Minute",
    exercise: "Boat Pose",
    repetitions: 1,
    intervals: 1,
  },
  {
    id: 17,
    description: "Do 50 Calf Raises",
    exercise: "Calf Raises",
    repetitions: 50,
    intervals: 5,
  },
  {
    id: 18,
    description: "Perform 30 Donkey Kicks",
    exercise: "Donkey Kicks",
    repetitions: 30,
    intervals: 3,
  },
  {
    id: 19,
    description: "Do 20 Glute Bridges",
    exercise: "Glute Bridges",
    repetitions: 20,
    intervals: 2,
  },
  {
    id: 20,
    description: "Stretch for 5 Minutes",
    exercise: "Full Body Stretch",
    repetitions: 5,
    intervals: 1,
  },
];

function getDailyChallenge(): Challenge {
  const today = new Date().toDateString();
  const seed = [...today].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = seed % challenges.length;
  return challenges[index];
}

// Usage
const todayChallenge = getDailyChallenge();
console.log("Today's Challenge:", todayChallenge);
