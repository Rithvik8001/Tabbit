import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
} from "@/design/primitives/sora-native";

import { Button } from "@/design/primitives/button";
import {
  HeaderPillButton,
  PageHeading,
} from "@/design/primitives/page-heading";
import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";
import { useFriendRequests } from "@/features/friends/hooks/use-friend-requests";
import { searchFriendCandidates } from "@/features/friends/lib/friend-requests-repository";
import type {
  FriendRelationshipStatus,
  FriendSearchCandidate,
} from "@/features/friends/types/friend-request.types";
import { getPersonLabel } from "@/features/shared/lib/person-label";

const SUGGESTION_LIMIT = 8;
const DEBOUNCE_MS = 350;

function getRelationshipBadge(
  status: FriendRelationshipStatus,
  colors: ReturnType<typeof useThemeColors>,
): {
  label: string;
  textColor: string;
  backgroundColor: string;
} {
  if (status === "already_friend") {
    return {
      label: "Friends",
      textColor: colors.financial.positive,
      backgroundColor: colors.state.successSoft,
    };
  }

  if (status === "outgoing_pending") {
    return {
      label: "Sent",
      textColor: colors.accent.primary,
      backgroundColor: colors.accent.soft,
    };
  }

  if (status === "incoming_pending") {
    return {
      label: "Incoming",
      textColor: colors.state.info,
      backgroundColor: colors.state.infoSoft,
    };
  }

  return {
    label: "Can request",
    textColor: colors.text.tertiary,
    backgroundColor: colors.background.subtle,
  };
}

export default function AddFriendScreen() {
  const colors = useThemeColors();
  const ink = colors.text.primary;
  const muted = colors.text.secondary;
  const accent = colors.accent.primary;
  const router = useRouter();
  const { sendRequest, isSendingToUser } = useFriendRequests();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<FriendSearchCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const cacheRef = useRef<Map<string, FriendSearchCandidate[]>>(new Map());

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const normalized = query.trim().toLowerCase();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setSearchError(null);
    setStatusMessage(null);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (normalized.length < 2) {
      setSuggestions([]);
      setIsSearching(false);

      return;
    }

    const cached = cacheRef.current.get(normalized);

    if (cached) {
      setSuggestions(cached);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    debounceTimeoutRef.current = setTimeout(() => {
      void (async () => {
        const result = await searchFriendCandidates(
          normalized,
          SUGGESTION_LIMIT,
        );

        if (requestIdRef.current !== requestId) {
          return;
        }

        setIsSearching(false);

        if (!result.ok) {
          setSuggestions([]);
          setSearchError(result.message);
          return;
        }

        cacheRef.current.set(normalized, result.data);
        setSuggestions(result.data);
      })();
    }, DEBOUNCE_MS);
  }, [query]);

  const updateCandidateStatus = (
    userId: string,
    nextStatus: FriendRelationshipStatus,
  ) => {
    setSuggestions((current) =>
      current.map((candidate) =>
        candidate.userId === userId
          ? { ...candidate, relationshipStatus: nextStatus }
          : candidate,
      ),
    );

    cacheRef.current.forEach((currentCandidates, key) => {
      const updatedCandidates = currentCandidates.map((candidate) =>
        candidate.userId === userId
          ? { ...candidate, relationshipStatus: nextStatus }
          : candidate,
      );
      cacheRef.current.set(key, updatedCandidates);
    });
  };

  const handleSendRequest = (candidate: FriendSearchCandidate) => {
    setSearchError(null);
    setStatusMessage(null);

    void (async () => {
      const result = await sendRequest(candidate.userId);

      if (!result.ok) {
        setSearchError(result.message);
        return;
      }

      updateCandidateStatus(candidate.userId, "outgoing_pending");
      setStatusMessage(
        `Request sent to ${getPersonLabel({
          displayName: candidate.displayName,
          email: candidate.email,
        })}.`,
      );
    })();
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        gap: 12,
      }}
    >
      <PageHeading
        size="section"
        title="Add Friend"
        subtitle="Search by username or email."
        leading={
          <HeaderPillButton label="Back" onPress={() => router.back()} />
        }
      />

      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: colors.surface.card,
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{
            color: ink,
            fontSize: 18,
            lineHeight: 22,
            fontWeight: "600",
          }}
        >
          Find friends
        </Text>

        <Text
          selectable
          style={{
            color: muted,
            fontSize: 14,
            lineHeight: 18,
            fontWeight: "500",
          }}
        >
          Search by username or email to send a friend request.
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Name or email"
          placeholderTextColor={colors.text.tertiary}
          selectionColor={accent}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          style={{
            borderRadius: radiusTokens.control,
            borderCurve: "continuous",
            borderWidth: 1.5,
            borderColor: "transparent",
            backgroundColor: colors.background.subtle,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: ink,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "600",
          }}
        />

        {isSearching ? (
          <Text
            selectable
            style={{
              color: muted,
              fontSize: 13,
              lineHeight: 16,
              fontWeight: "600",
            }}
          >
            Looking up users...
          </Text>
        ) : null}
      </View>

      {query.trim().length >= 2 && !isSearching ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            backgroundColor: colors.surface.card,
            overflow: "hidden",
          }}
        >
          {suggestions.length === 0 ? (
            <Text
              selectable
              style={{
                color: muted,
                fontSize: 14,
                lineHeight: 18,
                fontWeight: "500",
                padding: 12,
              }}
            >
              No users found.
            </Text>
          ) : (
            suggestions.map((candidate) => {
              const badge = getRelationshipBadge(
                candidate.relationshipStatus,
                colors,
              );
              const canRequest = candidate.relationshipStatus === "can_request";

              return (
                <View
                  key={candidate.userId}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 11,
                    borderTopWidth:
                      suggestions[0]?.userId === candidate.userId ? 0 : 1,
                    borderTopColor: colors.border.subtle,
                    backgroundColor: colors.surface.cardStrong,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        selectable
                        style={{
                          color: ink,
                          fontSize: 15,
                          lineHeight: 19,
                          fontWeight: "600",
                        }}
                      >
                        {getPersonLabel({
                          displayName: candidate.displayName,
                          email: candidate.email,
                        })}
                      </Text>
                      {candidate.email ? (
                        <Text
                          selectable
                          style={{
                            color: muted,
                            fontSize: 13,
                            lineHeight: 17,
                            fontWeight: "500",
                          }}
                        >
                          {candidate.email}
                        </Text>
                      ) : null}
                    </View>

                    <View
                      style={{
                        borderRadius: 999,
                        borderCurve: "continuous",
                        backgroundColor: badge.backgroundColor,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        selectable
                        style={{
                          color: badge.textColor,
                          fontSize: 11,
                          lineHeight: 14,
                          fontWeight: "600",
                        }}
                      >
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  {canRequest ? (
                    <Button
                      label="Send request"
                      size="sm"
                      tone="blue"
                      loading={isSendingToUser(candidate.userId)}
                      disabled={isSendingToUser(candidate.userId)}
                      onPress={() => {
                        handleSendRequest(candidate);
                      }}
                    />
                  ) : (
                    <Text
                      selectable
                      style={{
                        color: muted,
                        fontSize: 12,
                        lineHeight: 16,
                        fontWeight: "500",
                      }}
                    >
                      {candidate.relationshipStatus === "incoming_pending"
                        ? "Open Friends tab to accept this request."
                        : candidate.relationshipStatus === "outgoing_pending"
                          ? "Request pending."
                          : "You are already connected."}
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>
      ) : null}

      {searchError ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            backgroundColor: colors.state.dangerSoft,
            padding: 12,
          }}
        >
          <Text
            selectable
            style={{
              color: colors.state.danger,
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "600",
            }}
          >
            {searchError}
          </Text>
        </View>
      ) : null}

      {statusMessage ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            backgroundColor: colors.accent.soft,
            padding: 12,
          }}
        >
          <Text
            selectable
            style={{
              color: colors.accent.primary,
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "600",
            }}
          >
            {statusMessage}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
