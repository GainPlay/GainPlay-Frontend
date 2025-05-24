// import { useEffect, useState } from "react";
import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import { Toaster } from "./components/ui/toaster";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import FriendsPage from "./pages/FriendsPage";
import HomePage from "./pages/HomePage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import WorkoutHistoryPage from "./pages/WorkoutHistoryPage";
import {
  getValidAccessToken,
  setDefaultAxiosConfig
} from "./services/authService";

function App() {
  const navigate = useNavigate();
  const access_token = getValidAccessToken();

  // Redirect if trying to navigate from AuthPage to other routes
  useEffect(() => {
    if (location.pathname !== "/" && !access_token) {
      // If user is not authenticated, redirect them to the / route
      navigate("/");
    }
  }, [location, access_token]);

  setDefaultAxiosConfig();

  return (
    <>
      <div className="bg-purple-100 text-purple-900 min-h-screen">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/workout-history" element={<WorkoutHistoryPage />} />
          <Route path="/user-profile/:id" element={<UserProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {/* Conditionally render Navigation based on the current route */}
        {location.pathname !== "/" && location.pathname !== "/onboarding" && (
          <Navigation />
        )}
        <Toaster />
      </div>
    </>
  );
}

export default App;
