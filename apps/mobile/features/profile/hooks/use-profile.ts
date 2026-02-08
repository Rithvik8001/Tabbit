import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/state/auth-provider";
import { getDisplayNameValidationMessage } from "@/features/auth/utils/auth-validation";
import {
  getMyProfile,
  updateMyDisplayName,
} from "@/features/profile/lib/profile-repository";
import type { Profile } from "@/features/profile/types/profile.types";

type ActionResult = { ok: true } | { ok: false; message: string };

type UseProfileValue = {
  profile: Profile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveDisplayName: (nextDisplayName: string) => Promise<ActionResult>;
};

export function useProfile(): UseProfileValue {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const result = await getMyProfile(user.id);

    if (!result.ok) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    setProfile(result.data);
    setError(null);
    setIsLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const saveDisplayName = useCallback(
    async (nextDisplayName: string): Promise<ActionResult> => {
      if (!user?.id) {
        return { ok: false, message: "No active session." };
      }

      const validationMessage = getDisplayNameValidationMessage(nextDisplayName);
      if (validationMessage) {
        return { ok: false, message: validationMessage };
      }

      setIsSaving(true);

      const result = await updateMyDisplayName(user.id, nextDisplayName);

      setIsSaving(false);

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      setProfile(result.data);
      setError(null);
      return { ok: true };
    },
    [user?.id],
  );

  return {
    profile,
    isLoading,
    isSaving,
    error,
    refresh,
    saveDisplayName,
  };
}
