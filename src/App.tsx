// import { useEffect, useState } from "react";
import AuthCallback from "@/pages/AuthCallback";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import FriendsPage from "./pages/FriendsPage";
import HomePage from "./pages/HomePage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import WorkoutHistoryPage from "./pages/WorkoutHistoryPage";
import { getValidAccessToken, setDefaultAxiosConfig } from "./services/authService";
import { userService } from "./services/userService";
import { useUserStore } from "./stores/useUserStore";
import { ACCESS_TOKEN_KEY } from "./utils/constants";
import ProgressPage from "@/pages/ProgressPage";

function App() {
  const navigate = useNavigate();
  const access_token = getValidAccessToken();
  const user = useUserStore();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!access_token) {
        navigate("/");
      }

      if (access_token && location.pathname === "/") {
        navigate("/home");
      }

      const token = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (token) {
        const decodedToken = token ? jwtDecode<{ email: string }>(token) : null;
        const fetchedUser = await userService.getUserDataByMail(decodedToken?.email || "");
        user.setUser({
          ...fetchedUser,
          ...fetchedUser.user_settings,
          ...fetchedUser.user_badges,
          ...fetchedUser.user_goals,
        });

        if (!fetchedUser.finished_onboarding) {
          navigate("/onboarding");
        }
      }
    };

    fetchUserData();
  }, [location, access_token]);

  setDefaultAxiosConfig();

  return (
    <>
      <div className="bg-purple-100 text-purple-900 min-h-screen">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/workout-history" element={<WorkoutHistoryPage />} />
          <Route path="/user-profile/:id" element={<UserProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </>
  );
}

export default App;
