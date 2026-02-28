import { useAuth } from "../lib/AuthContext.jsx";
import Login from "./Login.jsx";

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <div>{children}</div>;
}
