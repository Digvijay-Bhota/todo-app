import { useState } from "react";
import { supabase } from "../lib/supabase.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUpView, setIsSignUpView] = useState(false); // Clean UI toggle view

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields.");
    
    setLoading(true);
    setError("");

    if (isSignUpView) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="app" style={{ marginTop: "100px" }}>
      <div className="topbar" style={{ justifyContent: "center" }}>
        <h1 style={{ fontSize: "32px" }}>
          {isSignUpView ? "Create Account" : "Welcome Back"}
        </h1>
      </div>

      <form onSubmit={handleAuth} className="addbox" style={{ gap: "16px" }}>
        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--muted)", marginBottom: "6px", display: "block" }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--muted)", marginBottom: "6px", display: "block" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: "var(--danger)", fontSize: "13px", fontWeight: "500", textAlign: "center" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={{ marginTop: "8px" }}>
          {loading ? "Processing..." : isSignUpView ? "Sign Up" : "Log In"}
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
          {isSignUpView ? "Already have an account? " : "New to this app? "}
          <span
            onClick={() => {
              setIsSignUpView(!isSignUpView);
              setError("");
            }}
            style={{ color: "var(--brand)", cursor: "pointer", fontWeight: "600" }}
          >
            {isSignUpView ? "Log In" : "Sign Up"}
          </span>
        </p>
      </form>
    </div>
  );
}
