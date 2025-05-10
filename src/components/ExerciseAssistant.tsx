import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
};

type ExerciseAssistantProps = {
  exerciseName: string;
};

export default function ExerciseAssistant({
  exerciseName
}: ExerciseAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting when chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: "1",
            content: `Hi there! I'm your GainPlay assistant. Need help with ${exerciseName}? Just ask!`,
            sender: "assistant"
          }
        ]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen, exerciseName, messages.length]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user"
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate assistant response
    setTimeout(() => {
      const response = generateResponse(input, exerciseName);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: "assistant"
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4 w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden border border-purple-200"
          >
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-3 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white mr-2 overflow-hidden">
                  <img
                    src="/GainPlay.png"
                    alt="GainPlay Logo"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-white font-medium">Exercise Assistant</h3>
              </div>
              <div className="flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-purple-700 rounded-full"
                  onClick={minimizeChat}
                >
                  <MinusCircle className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-purple-700 rounded-full"
                  onClick={toggleChat}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="h-64 overflow-y-auto p-3 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start mb-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-200 flex">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this exercise..."
                className="flex-1 mr-2"
              />
              <Button
                onClick={handleSend}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMinimized && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="mb-4 bg-white p-2 rounded-lg shadow-md border border-purple-200"
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:bg-purple-50 p-1"
            onClick={() => setIsMinimized(false)}
          >
            <span className="text-xs font-medium">Exercise Assistant</span>
          </Button>
        </motion.div>
      )}

      <Button
        onClick={toggleChat}
        className={`rounded-full w-14 h-14 shadow-lg ${
          isOpen
            ? "bg-purple-700 hover:bg-purple-800"
            : "bg-purple-600 hover:bg-purple-700"
        }`}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}

// Function to generate responses based on user input
function generateResponse(input: string, exerciseName: string): string {
  const inputLower = input.toLowerCase();

  // Exercise form responses
  if (
    inputLower.includes("form") ||
    inputLower.includes("how to") ||
    inputLower.includes("technique")
  ) {
    if (exerciseName.toLowerCase().includes("push-up")) {
      return "For proper push-up form: Start in a plank position with hands slightly wider than shoulders. Keep your body in a straight line, core engaged. Lower your chest to the floor by bending your elbows at a 45-degree angle, then push back up. Don't let your hips sag or pike up.";
    } else if (exerciseName.toLowerCase().includes("squat")) {
      return "For proper squat form: Stand with feet shoulder-width apart. Keep your chest up and back straight. Lower your body by bending your knees and pushing your hips back as if sitting in a chair. Go as low as comfortable, ideally thighs parallel to ground. Push through your heels to stand back up.";
    } else if (exerciseName.toLowerCase().includes("plank")) {
      return "For proper plank form: Position your forearms on the ground with elbows directly under your shoulders. Extend your legs behind you and rise up on your toes. Keep your body in a straight line from head to heels. Engage your core and don't let your hips sag or pike up.";
    } else {
      return `For proper ${exerciseName} form, focus on controlled movements and proper alignment. Keep your core engaged throughout the exercise. Would you like more specific tips?`;
    }
  }

  // Difficulty modifications
  else if (
    inputLower.includes("easier") ||
    inputLower.includes("too hard") ||
    inputLower.includes("modify")
  ) {
    return `To make ${exerciseName} easier, you can try a modified version. For example, reduce the range of motion, use support, or decrease the repetitions. Would you like a specific modification suggestion?`;
  }

  // Benefits questions
  else if (
    inputLower.includes("benefit") ||
    inputLower.includes("good for") ||
    inputLower.includes("target")
  ) {
    return `${exerciseName} is great for building strength and endurance in your muscles. It primarily targets specific muscle groups and helps improve your overall fitness. Regular practice will enhance your performance in daily activities too!`;
  }

  // Pain or discomfort
  else if (
    inputLower.includes("pain") ||
    inputLower.includes("hurt") ||
    inputLower.includes("sore")
  ) {
    return "If you're experiencing pain (not just muscle fatigue), you should stop the exercise. Make sure your form is correct, and consider consulting with a fitness professional or healthcare provider if pain persists. Remember, discomfort from exertion is normal, but sharp pain is not.";
  }

  // Default response
  else {
    return `That's a great question about ${exerciseName}! I'm here to help with form, modifications, benefits, or any other questions you might have about this exercise. Could you provide more details about what you'd like to know?`;
  }
}
