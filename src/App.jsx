import TodoList from "./components/TodoList.jsx";
import AuthGate from "./components/AuthGate.jsx";
import { AuthProvider } from "./lib/AuthContext.jsx";

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <TodoList />
      </AuthGate>
    </AuthProvider>
  );
}
