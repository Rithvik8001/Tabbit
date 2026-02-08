import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function getProfile(
  userId: string,
): Promise<{ display_name: string; email: string | null } | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("display_name, email")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as { display_name: string; email: string | null };
}

export async function shouldNotify(
  userId: string,
  preferenceKey: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("notification_preferences")
    .select(preferenceKey)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    // Default to true if no preferences row exists
    return true;
  }

  return (data as Record<string, boolean>)[preferenceKey] !== false;
}
