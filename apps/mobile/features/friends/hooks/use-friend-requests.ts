import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/state/auth-provider";
import {
  cancelFriendRequest,
  listIncomingFriendRequests,
  listOutgoingFriendRequests,
  respondToFriendRequest,
  sendFriendRequest,
} from "@/features/friends/lib/friend-requests-repository";
import type { FriendRequest } from "@/features/friends/types/friend-request.types";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; message: string };

type UseFriendRequestsValue = {
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  isLoading: boolean;
  error: string | null;
  isSendingToUser: (userId: string) => boolean;
  isMutatingRequest: (requestId: string) => boolean;
  refresh: () => Promise<void>;
  sendRequest: (
    targetUserId: string,
  ) => Promise<ActionResult<{ requestId: string }>>;
  acceptRequest: (
    requestId: string,
  ) => Promise<
    ActionResult<{ requestId: string; directGroupId: string | null }>
  >;
  declineRequest: (
    requestId: string,
  ) => Promise<ActionResult<{ requestId: string }>>;
  cancelRequest: (
    requestId: string,
  ) => Promise<ActionResult<{ requestId: string }>>;
};

export function useFriendRequests(): UseFriendRequestsValue {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingUserIds, setSendingUserIds] = useState<Set<string>>(new Set());
  const [mutatingRequestIds, setMutatingRequestIds] = useState<Set<string>>(
    new Set(),
  );

  const isSendingToUser = useCallback(
    (userId: string) => sendingUserIds.has(userId),
    [sendingUserIds],
  );

  const isMutatingRequest = useCallback(
    (requestId: string) => mutatingRequestIds.has(requestId),
    [mutatingRequestIds],
  );

  const setSendingUser = useCallback((userId: string, isSending: boolean) => {
    setSendingUserIds((current) => {
      const next = new Set(current);
      if (isSending) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  }, []);

  const setRequestMutation = useCallback(
    (requestId: string, isMutating: boolean) => {
      setMutatingRequestIds((current) => {
        const next = new Set(current);
        if (isMutating) {
          next.add(requestId);
        } else {
          next.delete(requestId);
        }
        return next;
      });
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const [incomingResult, outgoingResult] = await Promise.all([
      listIncomingFriendRequests("pending"),
      listOutgoingFriendRequests("pending"),
    ]);

    if (!incomingResult.ok) {
      setError(incomingResult.message);
      setIsLoading(false);
      return;
    }

    if (!outgoingResult.ok) {
      setError(outgoingResult.message);
      setIsLoading(false);
      return;
    }

    setIncomingRequests(incomingResult.data);
    setOutgoingRequests(outgoingResult.data);
    setError(null);
    setIsLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const sendRequestAction = useCallback(
    async (
      targetUserId: string,
    ): Promise<ActionResult<{ requestId: string }>> => {
      if (!user?.id) {
        return { ok: false, message: "Sign in to send friend requests." };
      }

      if (sendingUserIds.has(targetUserId)) {
        return { ok: false, message: "A request is already being sent." };
      }

      setSendingUser(targetUserId, true);
      const result = await sendFriendRequest(targetUserId);
      setSendingUser(targetUserId, false);

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      await refresh();

      return { ok: true, data: { requestId: result.data.requestId } };
    },
    [refresh, sendingUserIds, setSendingUser, user?.id],
  );

  const acceptRequest = useCallback(
    async (
      requestId: string,
    ): Promise<
      ActionResult<{ requestId: string; directGroupId: string | null }>
    > => {
      if (mutatingRequestIds.has(requestId)) {
        return {
          ok: false,
          message: "This request is already being processed.",
        };
      }

      setRequestMutation(requestId, true);
      const result = await respondToFriendRequest(requestId, "accept");
      setRequestMutation(requestId, false);

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      await refresh();

      return {
        ok: true,
        data: {
          requestId: result.data.requestId,
          directGroupId: result.data.directGroupId,
        },
      };
    },
    [mutatingRequestIds, refresh, setRequestMutation],
  );

  const declineRequest = useCallback(
    async (requestId: string): Promise<ActionResult<{ requestId: string }>> => {
      if (mutatingRequestIds.has(requestId)) {
        return {
          ok: false,
          message: "This request is already being processed.",
        };
      }

      setRequestMutation(requestId, true);
      const result = await respondToFriendRequest(requestId, "decline");
      setRequestMutation(requestId, false);

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      await refresh();

      return { ok: true, data: { requestId: result.data.requestId } };
    },
    [mutatingRequestIds, refresh, setRequestMutation],
  );

  const cancelRequestAction = useCallback(
    async (requestId: string): Promise<ActionResult<{ requestId: string }>> => {
      if (mutatingRequestIds.has(requestId)) {
        return {
          ok: false,
          message: "This request is already being processed.",
        };
      }

      setRequestMutation(requestId, true);
      const result = await cancelFriendRequest(requestId);
      setRequestMutation(requestId, false);

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      await refresh();

      return { ok: true, data: { requestId: result.data.requestId } };
    },
    [mutatingRequestIds, refresh, setRequestMutation],
  );

  return {
    incomingRequests,
    outgoingRequests,
    isLoading,
    error,
    isSendingToUser,
    isMutatingRequest,
    refresh,
    sendRequest: sendRequestAction,
    acceptRequest,
    declineRequest,
    cancelRequest: cancelRequestAction,
  };
}
