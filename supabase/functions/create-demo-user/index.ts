
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Delete existing demo user
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const demoUser = existingUsers?.users?.find((u: any) => u.email === "demo@edumentor.app");
  if (demoUser) {
    await supabase.auth.admin.deleteUser(demoUser.id);
  }

  // Create demo user via admin API
  const { data, error } = await supabase.auth.admin.createUser({
    email: "demo@edumentor.app",
    password: "Demo@12345",
    email_confirm: true,
    user_metadata: { display_name: "مرشد تجريبي" }
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  // Assign counselor role
  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert({ user_id: data.user.id, role: "counselor" }, { onConflict: "user_id,role" });

  return new Response(JSON.stringify({ success: true, userId: data.user.id, roleError }), {
    headers: { "Content-Type": "application/json" }
  });
});
