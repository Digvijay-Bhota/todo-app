import { supabase } from "./supabase.jsx";

// CREATE a task
export async function addTask(text, userId, priority = "medium", due = null) {
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      { text, completed: false, user_id: userId, priority, due }
    ])
    .select()
    .single(); // ✅ expect exactly one new task

  if (error) {
    console.error("Error adding task:", error.message);
    throw error;
  }
  return data;
}

// READ all tasks for a user
export async function getTasks(userId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false }); // ✅ sort newest first

  if (error) {
    console.error("Error fetching tasks:", error.message);
    throw error;
  }
  return data || [];
}

// UPDATE toggle completion
export async function toggleComplete(id, completed) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ completed, updated_at: new Date().toISOString() }) // ✅ keep updated_at fresh
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error toggling task:", error.message);
    throw error;
  }
  return data;
}

// DELETE one task
export async function deleteTask(id) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting task:", error.message);
    throw error;
  }
}

// DELETE all completed tasks for a user
export async function clearCompleted(userId) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("user_id", userId)
    .eq("completed", true);

  if (error) {
    console.error("Error clearing completed tasks:", error.message);
    throw error;
  }
}
