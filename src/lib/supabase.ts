import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ejapgtezhvkuezbpklkw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqYXBndGV6aHZrdWV6YnBrbGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MjgwOTksImV4cCI6MjA4ODMwNDA5OX0.0VUtZxTdXKcg1eE0lLZ7qFdFeclGb5VUpzBWypYA1CQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
