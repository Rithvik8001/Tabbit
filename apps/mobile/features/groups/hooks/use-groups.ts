import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/state/auth-provider";
import {
  createGroup as createGroupRecord,
  listGroupsForUser,
} from "@/features/groups/lib/groups-repository";
import type { CreateGroupInput, Group } from "@/features/groups/types/group.types";

type UseGroupsOptions = {
  autoRefreshOnFocus?: boolean;
};

type CreateGroupActionResult = { ok: true } | { ok: false; message: string };

type UseGroupsValue = {
  groups: Group[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createGroup: (input: CreateGroupInput) => Promise<CreateGroupActionResult>;
};

export function useGroups(options: UseGroupsOptions = {}): UseGroupsValue {
  const { autoRefreshOnFocus = true } = options;
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(autoRefreshOnFocus);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setGroups([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const result = await listGroupsForUser(user.id);

    if (!result.ok) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    setGroups(result.data);
    setError(null);
    setIsLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (!autoRefreshOnFocus) {
        return;
      }

      void refresh();
    }, [autoRefreshOnFocus, refresh]),
  );

  const createGroup = useCallback(
    async (input: CreateGroupInput): Promise<CreateGroupActionResult> => {
      if (!user?.id) {
        return {
          ok: false,
          message: "Sign in to create a group.",
        };
      }

      setIsCreating(true);

      const result = await createGroupRecord(input, user.id);

      setIsCreating(false);

      if (!result.ok) {
        return {
          ok: false,
          message: result.message,
        };
      }

      setGroups((previous) => [
        result.data,
        ...previous.filter((group) => group.id !== result.data.id),
      ]);
      setError(null);

      return { ok: true };
    },
    [user?.id],
  );

  return {
    groups,
    isLoading,
    isCreating,
    error,
    refresh,
    createGroup,
  };
}
