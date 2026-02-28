import { useState } from "react"
import { supabase } from "../lib/supabase.jsx"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSignup = async () => {
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="app">
      <div className="topbar">
        <h1>Welcome</h1>
      </div>

      <div className="addbox" style={{ flexDirection: "column", gap: "12px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{ background: "var(--brand)" }}
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>

        <button className="danger" onClick={handleLogout}>
          Log out
        </button>

        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      </div>
    </div>
  )
}
