// src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveTokens, setDefaultAxiosConfig } from "@/services/authService";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      console.error("Google authentication error:", error);
      navigate("/login");
      return;
    }

    if (token) {
      saveTokens({ accessToken: token });
      setDefaultAxiosConfig();
      navigate("/home");
    } else {
      console.error("No token received");
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign-in...</p>
      </div>
    </div>
  );
}
