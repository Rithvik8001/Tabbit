import { supabase } from "@/features/auth/lib/supabase-client";
import type {
  NotificationPreferenceKey,
  NotificationPreferencesRow,
} from "@/features/notifications/types/notification-preferences.types";

type Result<T> = { ok: true; data: T } | { ok: false; message: string };

export async function getNotificationPreferences(
  userId: string,
): Promise<Result<NotificationPreferencesRow>> {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "No notification preferences found." };
  }

  return { ok: true, data: data as NotificationPreferencesRow };
}

export async function updateNotificationPreference(
  userId: string,
  key: NotificationPreferenceKey,
  value: boolean,
): Promise<Result<NotificationPreferencesRow>> {
  const { data, error } = await supabase
    .from("notification_preferences")
    .update({ [key]: value })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, data: data as NotificationPreferencesRow };
}

export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<Record<NotificationPreferenceKey, boolean>>,
): Promise<Result<NotificationPreferencesRow>> {
  const { data, error } = await supabase
    .from("notification_preferences")
    .update(updates)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, data: data as NotificationPreferencesRow };
}
