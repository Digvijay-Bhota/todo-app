import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.jsx";
import { useAuth } from "../lib/AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

import {
  addTask as addTaskDb,
  getTasks,
  toggleComplete,
  deleteTask,
  clearCompleted
} from "../lib/tasks.jsx";

export default function TodoList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("medium"); // ✅ new
  const [due, setDue] = useState(""); // ✅ new
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Load tasks
  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await getTasks(user.id);
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  // Add new task
  const addTask = async () => {
    const text = newTask.trim();
    if (!text) return;
    try {
      const task = await addTaskDb(text, user.id, priority, due || null);
      setTasks((prev) => [task, ...prev]);
      setNewTask("");
      setPriority("medium");
      setDue("");
    } catch (err) {
      console.error("Error adding task:", err.message);
    }
  };

  // Toggle complete
  const toggleTask = async (id, current) => {
    try {
      const updated = await toggleComplete(id, !current);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error("Error toggling task:", err.message);
    }
  };

  // Delete one task
  const removeTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err.message);
    }
  };

  // Clear completed
  const clearAllCompleted = async () => {
    try {
      await clearCompleted(user.id);
      setTasks((prev) => prev.filter((t) => !t.completed));
    } catch (err) {
      console.error("Error clearing completed tasks:", err.message);
    }
  };

  // Filter + search
  const filtered = useMemo(() => {
    const byQuery = (t) => t.text.toLowerCase().includes(query.toLowerCase());
    if (filter === "active") return tasks.filter((t) => !t.completed).filter(byQuery);
    if (filter === "done") return tasks.filter((t) => t.completed).filter(byQuery);
    return tasks.filter(byQuery);
  }, [tasks, filter, query]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to see your tasks.</p>;

  const chip = (key, label) => (
    <button
      onClick={() => setFilter(key)}
      className={`chip${filter === key ? " primary" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="app">
      <div className="topbar">
        <h1>Todos</h1>
        <input
          className="search"
          placeholder="Search tasks"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="grow" />
        <button className="chip" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "🌙 Dark"}
        </button>
        <button className="chip" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>

      <motion.div
        className="addbox"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">⬇ Low</option>
          <option value="medium">⬅ Medium</option>
          <option value="high">⬆ High</option>
        </select>
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />
        <button onClick={addTask}>Add</button>
      </motion.div>

      <div className="filters">
        {chip("all", "All")}
        {chip("active", "Active")}
        {chip("done", "Done")}
        <div className="grow" />
        <button className="danger" onClick={clearAllCompleted}>
          Clear completed
        </button>
      </div>

      <ul className="list">
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.li
              key="empty"
              className="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {query ? "No matching tasks." : "No tasks yet. Add one above!"}
            </motion.li>
          )}

          {filtered.map((t, i) => (
            <motion.li
              key={t.id}
              className="item"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="row">
                <input
                  type="checkbox"
                  checked={!!t.completed}
                  onChange={() => toggleTask(t.id, t.completed)}
                />
                <span className={t.completed ? "done" : ""}>
                  {t.text}
                </span>
              </div>
              <div className="row" style={{ gap: "8px", fontSize: "0.85em" }}>
                <span className={`priority ${t.priority}`}>📌 {t.priority}</span>
                {t.due && <span>⏰ {new Date(t.due).toLocaleDateString()}</span>}
              </div>
              <button className="danger" onClick={() => removeTask(t.id)}>✖</button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
