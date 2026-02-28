import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

function Root() {
  useEffect(() => {
    // Auto-detect dark mode from system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
