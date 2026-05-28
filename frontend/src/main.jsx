import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { DEFAULT_LANGUAGE } from "./i18n/translations.js";

if (DEFAULT_LANGUAGE === "BN") {
  document.documentElement.lang = "bn";
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
