import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
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
import { userService } from "./services/userService";
import type { UserData } from "./types";

function App() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      } else {
        const user = await userService.getUserData();
        setUserData(user);
        localStorage.setItem("userData", JSON.stringify(user));
      }
    };

    fetchData();
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
