import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // Import BrowserRouter
import App from "./App";
import "./index.css";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";

axios.defaults.baseURL = `${import.meta.env.VITE_REACT_APP_API_URL}/api`;
axios.defaults.headers["Content-Type"] = "application/json";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <App />
      </Router>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
