import { supabase } from "@/features/auth/lib/supabase-client";
import type { Profile, ProfileRow } from "@/features/profile/types/profile.types";

type ProfileResult<T> = { ok: true; data: T } | { ok: false; message: string };

function normalizeError(
  fallbackMessage: string,
  error: { message: string; code?: string | null } | null,
): string {
  if (!error) {
    return fallbackMessage;
  }

  if (error.message.toLowerCase().includes("network")) {
    return "Network issue while contacting Supabase. Try again.";
  }

  return error.message || fallbackMessage;
}

function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    updatedAt: row.updated_at,
  };
}

export async function getMyProfile(
  userId: string,
): Promise<ProfileResult<Profile | null>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to load profile.", error),
    };
  }

  if (!data) {
    return { ok: true, data: null };
  }

  return {
    ok: true,
    data: mapProfileRow(data as ProfileRow),
  };
}

export async function updateMyDisplayName(
  userId: string,
  displayName: string,
): Promise<ProfileResult<Profile>> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName.trim() })
    .eq("id", userId)
    .select("id, email, display_name, updated_at")
    .single();

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to update username.", error),
    };
  }

  return {
    ok: true,
    data: mapProfileRow(data as ProfileRow),
  };
}
