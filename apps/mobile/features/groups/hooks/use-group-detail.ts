import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/state/auth-provider";
import {
  addGroupMember,
  findUserByEmail,
  listGroupMembers,
  removeGroupMember,
} from "@/features/groups/lib/group-members-repository";
import {
  deleteGroup as deleteGroupRecord,
  getGroupById,
  updateGroup as updateGroupRecord,
} from "@/features/groups/lib/groups-repository";
import type { GroupMember } from "@/features/groups/types/group-member.types";
import type { Group, UpdateGroupInput } from "@/features/groups/types/group.types";

type ActionResult = { ok: true } | { ok: false; message: string };

type UseGroupDetailValue = {
  group: Group | null;
  members: GroupMember[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addMember: (email: string) => Promise<ActionResult>;
  removeMember: (memberId: string) => Promise<ActionResult>;
  updateGroup: (input: UpdateGroupInput) => Promise<ActionResult>;
  deleteGroup: () => Promise<ActionResult>;
  isAddingMember: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
};

export function useGroupDetail(groupId: string | undefined): UseGroupDetailValue {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = useCallback(async () => {
    if (!groupId || !user?.id) {
      setGroup(null);
      setMembers([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const [groupResult, membersResult] = await Promise.all([
      getGroupById(groupId),
      listGroupMembers(groupId),
    ]);

    if (!groupResult.ok) {
      setError(groupResult.message);
      setIsLoading(false);
      return;
    }

    if (!membersResult.ok) {
      setError(membersResult.message);
      setIsLoading(false);
      return;
    }

    setGroup(groupResult.data);
    setMembers(membersResult.data);
    setError(null);
    setIsLoading(false);
  }, [groupId, user?.id]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const addMember = useCallback(
    async (email: string): Promise<ActionResult> => {
      if (!groupId) {
        return { ok: false, message: "No group selected." };
      }

      setIsAddingMember(true);

      const userResult = await findUserByEmail(email);

      if (!userResult.ok) {
        setIsAddingMember(false);
        return { ok: false, message: userResult.message };
      }

      const existingMember = members.find((m) => m.userId === userResult.data.id);
      if (existingMember) {
        setIsAddingMember(false);
        return { ok: false, message: "This user is already a member of the group." };
      }

      const result = await addGroupMember(groupId, userResult.data.id);

      setIsAddingMember(false);

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      setMembers((prev) => [...prev, result.data]);

      return { ok: true };
    },
    [groupId, members],
  );

  const removeMember = useCallback(
    async (memberId: string): Promise<ActionResult> => {
      const result = await removeGroupMember(memberId);

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberId));

      return { ok: true };
    },
    [],
  );

  const updateGroup = useCallback(
    async (input: UpdateGroupInput): Promise<ActionResult> => {
      if (!groupId) {
        return { ok: false, message: "No group selected." };
      }

      setIsUpdating(true);

      const result = await updateGroupRecord(groupId, input);

      setIsUpdating(false);

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      setGroup(result.data);

      return { ok: true };
    },
    [groupId],
  );

  const deleteGroup = useCallback(async (): Promise<ActionResult> => {
    if (!groupId) {
      return { ok: false, message: "No group selected." };
    }

    setIsDeleting(true);

    const result = await deleteGroupRecord(groupId);

    setIsDeleting(false);

    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    return { ok: true };
  }, [groupId]);

  return {
    group,
    members,
    isLoading,
    error,
    refresh,
    addMember,
    removeMember,
    updateGroup,
    deleteGroup,
    isAddingMember,
    isUpdating,
    isDeleting,
  };
}
