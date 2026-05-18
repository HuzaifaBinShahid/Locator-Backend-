import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: WebSocket },
});

const connectDB = async () => {
  const { error } = await supabase.from("users").select("id").limit(1);
  if (error && error.code !== "PGRST116") {
    console.error("❌ Supabase connection error:", error.message);
    throw new Error(`Supabase connection error: ${error.message}`);
  }
  console.log("✅ Supabase connected successfully 🧠");
};

export default connectDB;
