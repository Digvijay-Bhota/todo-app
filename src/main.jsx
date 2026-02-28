import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

function Root() {
    useEffect(() => {
        // Auto-detect dark mode on first load
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

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
