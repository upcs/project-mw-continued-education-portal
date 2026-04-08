import React from "react";
import ReactDOM from "react-dom/client";
import "./css/global.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthContext";
import { ReviewBadgeProvider } from "./context/ReviewBadgeContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ReviewBadgeProvider>
        <App />
      </ReviewBadgeProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();