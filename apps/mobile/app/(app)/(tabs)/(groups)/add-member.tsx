import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { isValidEmail } from "@/features/auth/utils/auth-validation";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";
import type { GroupMemberCandidate } from "@/features/groups/types/group-member.types";

const surface = colorSemanticTokens.surface.cardStrong;
const stroke = colorSemanticTokens.border.subtle;
const ink = colorSemanticTokens.text.primary;
const muted = colorSemanticTokens.text.secondary;
const accent = colorSemanticTokens.accent.primary;

const SUGGESTION_LIMIT = 8;
const DEBOUNCE_MS = 350;

function getCandidateInputValue(candidate: GroupMemberCandidate) {
  return candidate.email ?? candidate.displayName;
}

export default function AddMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addMember, addMemberByUserId, isAddingMember, searchMemberCandidates } =
    useGroupDetail(id);

  const [query, setQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] =
    useState<GroupMemberCandidate | null>(null);
  const [suggestions, setSuggestions] = useState<GroupMemberCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const cacheRef = useRef<Map<string, GroupMemberCandidate[]>>(new Map());

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const normalized = query.trim().toLowerCase();

    if (
      selectedCandidate &&
      normalized !== getCandidateInputValue(selectedCandidate).trim().toLowerCase()
    ) {
      setSelectedCandidate(null);
    }

    setSearchError(null);

    if (normalized.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      return;
    }

    const cached = cacheRef.current.get(normalized);
    if (cached) {
      setSuggestions(cached);
      setIsSearching(false);
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setIsSearching(true);

    debounceTimeoutRef.current = setTimeout(() => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      void (async () => {
        const result = await searchMemberCandidates(normalized, SUGGESTION_LIMIT);

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
  }, [query, searchMemberCandidates, selectedCandidate]);

  const handleAdd = () => {
    const trimmed = query.trim();

    setFormError(null);

    if (!selectedCandidate && !isValidEmail(trimmed)) {
      setFormError("Select a user from suggestions or enter a valid email address.");
      return;
    }

    void (async () => {
      const result = selectedCandidate
        ? await addMemberByUserId(selectedCandidate.id)
        : await addMember(trimmed);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      router.back();
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
      <View
        style={{
          borderRadius: 20,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: stroke,
          backgroundColor: surface,
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
        >
          Add member
        </Text>

        <Text
          selectable
          style={{ color: muted, fontSize: 14, lineHeight: 18, fontWeight: "500" }}
        >
          Search by username or email. You can also paste an exact email.
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Name or email"
          placeholderTextColor={colorSemanticTokens.text.tertiary}
          selectionColor={accent}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          style={{
            borderRadius: 14,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: stroke,
            backgroundColor: colorSemanticTokens.surface.cardMuted,
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
            style={{ color: muted, fontSize: 13, lineHeight: 16, fontWeight: "600" }}
          >
            Looking up users...
          </Text>
        ) : null}

        {searchError ? (
          <Text
            selectable
            style={{ color: colorSemanticTokens.state.danger, fontSize: 13, lineHeight: 16, fontWeight: "600" }}
          >
            {searchError}
          </Text>
        ) : null}
      </View>

      {query.trim().length >= 2 && !isSearching ? (
        <View
          style={{
            borderRadius: 16,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: stroke,
            backgroundColor: surface,
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
              const isSelected = selectedCandidate?.id === candidate.id;

              return (
                <Pressable
                  key={candidate.id}
                  onPress={() => {
                    setSelectedCandidate(candidate);
                    setQuery(getCandidateInputValue(candidate));
                    setFormError(null);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 11,
                    borderTopWidth: suggestions[0]?.id === candidate.id ? 0 : 1,
                    borderTopColor: stroke,
                    backgroundColor: isSelected ? colorSemanticTokens.accent.soft : colorSemanticTokens.surface.cardStrong,
                    gap: 2,
                  }}
                >
                  <Text
                    selectable
                    style={{
                      color: ink,
                      fontSize: 15,
                      lineHeight: 19,
                      fontWeight: "700",
                    }}
                  >
                    {candidate.displayName}
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
                </Pressable>
              );
            })
          )}
        </View>
      ) : null}

      {formError ? (
        <View
          style={{
            borderRadius: 14,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: "rgba(188, 43, 62, 0.24)",
            backgroundColor: colorSemanticTokens.state.dangerSoft,
            padding: 12,
          }}
        >
          <Text
            selectable
            style={{ color: colorSemanticTokens.state.danger, fontSize: 14, lineHeight: 18, fontWeight: "600" }}
          >
            {formError}
          </Text>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={isAddingMember}
        onPress={handleAdd}
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          backgroundColor: isAddingMember ? colorSemanticTokens.accent.softStrong : accent,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
          opacity: isAddingMember ? 0.8 : 1,
        }}
      >
        <Text
          selectable
          style={{
            color: colorSemanticTokens.text.inverse,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "700",
          }}
        >
          {isAddingMember ? "Adding..." : "Add Member"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
