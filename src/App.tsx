import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import OnboardingPage from "./pages/OnboardingPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from "./pages/FriendsPage";
import WorkoutHistoryPage from "./pages/WorkoutHistoryPage";
import UserProfilePage from "./pages/UserProfilePage";
import Navigation from "./components/Navigation";
import type { UserData } from "./types";
import { defaultUserData } from "./data/mockData";

function App() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    } else {
      setUserData(defaultUserData);
      localStorage.setItem("userData", JSON.stringify(defaultUserData));
    }
  }, []);

  const updateUserData = (newData: Partial<UserData>) => {
    setUserData((prevData) => {
      if (prevData) {
        const updatedData = { ...prevData, ...newData };
        localStorage.setItem("userData", JSON.stringify(updatedData));
        return updatedData;
      }
      return prevData;
    });
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="bg-purple-100 text-purple-900 pb-16 min-h-screen">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/home"
            element={
              <HomePage userData={userData} updateUserData={updateUserData} />
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage userData={userData} updateUserData={updateUserData} />
            }
          />
          <Route
            path="/profile"
            element={
              <ProfilePage
                userData={userData}
                updateUserData={updateUserData}
              />
            }
          />
          <Route
            path="/friends"
            element={
              <FriendsPage
                userData={userData}
                updateUserData={updateUserData}
              />
            }
          />
          <Route
            path="/workout-history"
            element={
              <WorkoutHistoryPage
                userData={userData}
                updateUserData={updateUserData}
              />
            }
          />
          <Route
            path="/user/:id"
            element={
              <UserProfilePage
                userData={userData}
                updateUserData={updateUserData}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Navigation />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
