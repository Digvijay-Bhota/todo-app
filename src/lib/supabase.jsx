import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // Helps you catch misnamed/missing envs immediately in dev
    console.warn(
        "[Supabase] Missing env. Expected VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local"
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
