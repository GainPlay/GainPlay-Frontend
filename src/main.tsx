import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { routes } from "./router";
import { createTheme, ThemeProvider } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: { main: "#F15BB5" },
    secondary: { main: "#00BBF9" },
    background: { default: "#9B5DE5" },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {routes.map((currRoute, index) => (
            <Route path={currRoute.path} Component={currRoute.component} key={index} />
          ))}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
