import { createClient } from "@supabase/supabase-js";
const env = (import.meta as unknown as { env: Record<string, string> }).env;
export const db =
  env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY
    ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY)
    : null;
export const unavailable =
  "This service is not connected yet. Nothing has been saved. Please try again once company contact details are available.";
