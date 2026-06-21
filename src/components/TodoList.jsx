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
  const [priority, setPriority] = useState("medium");
  const [due, setDue] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);

  // Smooth theme toggle using the .dark class on HTML root element
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Load tasks from Supabase
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

  // Toggle complete state
  const toggleTask = async (id, current) => {
    try {
      const updated = await toggleComplete(id, !current);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error("Error toggling task:", err.message);
    }
  };

  // Delete individual task
  const removeTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err.message);
    }
  };

  // Clear all completed tasks
  const clearAllCompleted = async () => {
    try {
      await clearCompleted(user.id);
      setTasks((prev) => prev.filter((t) => !t.completed));
    } catch (err) {
      console.error("Error clearing completed tasks:", err.message);
    }
  };

  // Live filter + text search
  const filtered = useMemo(() => {
    const byQuery = (t) => t.text.toLowerCase().includes(query.toLowerCase());
    if (filter === "active") return tasks.filter((t) => !t.completed).filter(byQuery);
    if (filter === "done") return tasks.filter((t) => t.completed).filter(byQuery);
    return tasks.filter(byQuery);
  }, [tasks, filter, query]);

  if (loading) return <div className="app"><p style={{ textAlign: "center", color: "var(--muted)" }}>Loading your list...</p></div>;
  if (!user) return <div className="app"><p style={{ textAlign: "center", color: "var(--muted)" }}>Please log in to see your tasks.</p></div>;

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
      {/* Top Controls Bar */}
      <div className="topbar">
        <h1>Todos</h1>
        <div className="grow" />
        <button className="chip" onClick={() => setDark((d) => !d)}>
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        <button className="chip" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>

      {/* Dynamic Search Box */}
      <div style={{ marginBottom: "16px" }}>
        <input
          className="search"
          placeholder="Search your tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Task Creation Form Card */}
      <motion.div
        className="addbox"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What needs to be done?"
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <div style={{ display: "flex", gap: "10px" }}>
          <select style={{ flex: 1 }} value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <input
            style={{ flex: 1 }}
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </div>
        <button onClick={addTask}>Add Task</button>
      </motion.div>

      {/* Filter Chips Bar */}
      <div className="filters">
        {chip("all", "All")}
        {chip("active", "Active")}
        {chip("done", "Done")}
        <div className="grow" />
        <button className="danger" onClick={clearAllCompleted}>
          Clear Completed
        </button>
      </div>

      {/* Task List Grid */}
      <ul className="list">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 && (
            <motion.li
              key="empty"
              className="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {query ? "No matching tasks found." : "Your task list is empty!"}
            </motion.li>
          )}

          {filtered.map((t, i) => (
            <motion.li
              key={t.id}
              className="item"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ delay: i * 0.02 }}
            >
              <div className="row">
                <input
                  type="checkbox"
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                  checked={!!t.completed}
                  onChange={() => toggleTask(t.id, t.completed)}
                />
                <span className={t.completed ? "done" : ""}>
                  {t.text}
                </span>
              </div>
              <div className="row" style={{ gap: "10px" }}>
                <span className={`priority ${t.priority}`}>{t.priority}</span>
                {t.due && (
                  <span style={{ color: "var(--muted)", fontSize: "12px" }}>
                    📅 {new Date(t.due).toLocaleDateString()}
                  </span>
                )}
                <button 
                  className="danger" 
                  onClick={() => removeTask(t.id)} 
                  style={{ padding: "4px 8px", background: "transparent", color: "var(--muted)" }}
                >
                  ✖
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
