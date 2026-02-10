import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, TextInput, View } from "@/design/primitives/sora-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useFriends } from "@/features/friends/hooks/use-friends";
import { ensureDirectFriendGroup } from "@/features/friends/lib/friend-requests-repository";
import { useGroups } from "@/features/groups/hooks/use-groups";
import { getPersonLabel } from "@/features/shared/lib/person-label";

function SelectionDot({ isSelected }: { isSelected: boolean }) {
  return (
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: radiusTokens.pill,
        borderCurve: "continuous",
        borderWidth: 2,
        borderColor: isSelected
          ? colorSemanticTokens.accent.primary
          : colorSemanticTokens.border.muted,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isSelected ? (
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: radiusTokens.pill,
            backgroundColor: colorSemanticTokens.accent.primary,
          }}
        />
      ) : null}
    </View>
  );
}

type ReturnTab = "friends" | "groups" | "activity";
type ExpenseContextScope = "friends" | "groups" | "all";

function normalizeScope(
  value: string | string[] | undefined,
): ExpenseContextScope {
  const first = Array.isArray(value) ? value[0] : value;
  if (first === "friends" || first === "groups") {
    return first;
  }

  return "all";
}

function normalizeReturnTab(
  value: string | string[] | undefined,
): ReturnTab | null {
  const first = Array.isArray(value) ? value[0] : value;
  if (first === "friends" || first === "groups" || first === "activity") {
    return first;
  }

  return null;
}

export default function AddExpenseContextScreen() {
  const router = useRouter();
  const { scope: scopeParam, returnTab: returnTabParam } = useLocalSearchParams<{
    scope?: string | string[];
    returnTab?: string | string[];
  }>();
  const { groups, isLoading: isGroupsLoading } = useGroups();
  const { friends, isLoading: isFriendsLoading } = useFriends();

  const scope = normalizeScope(scopeParam);
  const returnTab = normalizeReturnTab(returnTabParam);
  const showGroups = scope !== "friends";
  const showFriends = scope !== "groups";

  const [query, setQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const visibleGroups = useMemo(() => {
    if (!showGroups) {
      return [];
    }

    if (!normalizedQuery) {
      return groups;
    }

    return groups.filter((group) =>
      group.name.toLowerCase().includes(normalizedQuery),
    );
  }, [groups, normalizedQuery, showGroups]);

  const visibleFriends = useMemo(() => {
    if (!showFriends) {
      return [];
    }

    if (!normalizedQuery) {
      return friends;
    }

    return friends.filter((friend) => {
      const title = (friend.displayName ?? friend.email ?? "").toLowerCase();
      return title.includes(normalizedQuery);
    });
  }, [friends, normalizedQuery, showFriends]);

  const openExpenseForm = (groupId: string, returnTab: ReturnTab) => {
    router.replace({
      pathname: "/(app)/(tabs)/(groups)/add-expense",
      params: { id: groupId, returnTab },
    });
  };

  const handleSave = () => {
    if (isSubmitting) {
      return;
    }

    setError(null);

    if (scope === "groups" && !selectedGroupId) {
      setError("Choose one group.");
      return;
    }

    if (scope === "friends" && !selectedFriendId) {
      setError("Choose one friend.");
      return;
    }

    if (scope === "all" && !selectedGroupId && !selectedFriendId) {
      setError("Choose one group or one friend.");
      return;
    }

    setIsSubmitting(true);

    void (async () => {
      const resolvedReturnTab =
        returnTab ?? (scope === "friends" ? "friends" : "groups");

      if (selectedGroupId) {
        openExpenseForm(selectedGroupId, resolvedReturnTab);
        return;
      }

      if (!selectedFriendId) {
        setIsSubmitting(false);
        return;
      }

      const directGroupResult = await ensureDirectFriendGroup(selectedFriendId);

      if (!directGroupResult.ok) {
        setIsSubmitting(false);
        setError(directGroupResult.message);
        return;
      }

      openExpenseForm(directGroupResult.data, resolvedReturnTab);
    })();
  };

  const isDisabled =
    isSubmitting ||
    (scope === "groups"
      ? !selectedGroupId
      : scope === "friends"
        ? !selectedFriendId
        : !selectedGroupId && !selectedFriendId);

  const searchPlaceholder =
    scope === "groups"
      ? "Search groups"
      : scope === "friends"
        ? "Search friends"
        : "Enter names or emails";

  return (
    <View style={{ flex: 1, backgroundColor: colorSemanticTokens.background.canvas }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacingTokens.xl,
          paddingTop: spacingTokens.md,
          paddingBottom: spacingTokens["4xl"],
          gap: spacingTokens.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacingTokens.sm,
          }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: radiusTokens.pill,
              borderCurve: "continuous",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={24} color={colorSemanticTokens.text.primary} />
          </Pressable>

          <Text
            selectable
            style={[typographyScale.headingLg, { color: colorSemanticTokens.text.primary }]}
          >
            Add an expense
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={isDisabled}
            onPress={handleSave}
            style={{
              borderRadius: radiusTokens.pill,
              borderCurve: "continuous",
              minHeight: 40,
              paddingHorizontal: spacingTokens.sm,
              justifyContent: "center",
              opacity: isDisabled ? 0.45 : 1,
            }}
          >
            <Text
              selectable
              style={[typographyScale.headingSm, { color: colorSemanticTokens.accent.primary }]}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colorSemanticTokens.border.subtle,
            paddingBottom: spacingTokens.sm,
            gap: spacingTokens.sm,
          }}
        >
          <Text
            selectable
            style={[typographyScale.headingMd, { color: colorSemanticTokens.text.primary }]}
          >
            With you and:
          </Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={colorSemanticTokens.text.tertiary}
            selectionColor={colorSemanticTokens.accent.primary}
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              typographyScale.bodyLg,
              {
                borderRadius: radiusTokens.control,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: colorSemanticTokens.border.subtle,
                backgroundColor: colorSemanticTokens.surface.card,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: colorSemanticTokens.text.primary,
              },
            ]}
          />
        </View>

        {showGroups ? (
          <View style={{ gap: spacingTokens.sm }}>
            <Text
              selectable
              style={[typographyScale.headingMd, { color: colorSemanticTokens.text.primary }]}
            >
              Groups
            </Text>

            {isGroupsLoading ? (
              <Text
                selectable
                style={[typographyScale.bodySm, { color: colorSemanticTokens.text.secondary }]}
              >
                Loading groups...
              </Text>
            ) : null}

            {visibleGroups.map((group) => {
              const isSelected = selectedGroupId === group.id;

              return (
                <Pressable
                  key={group.id}
                  accessibilityRole="button"
                  onPress={() => {
                    setSelectedGroupId(group.id);
                    setSelectedFriendId(null);
                  }}
                  style={{
                    borderRadius: radiusTokens.card,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: isSelected
                      ? colorSemanticTokens.accent.primary
                      : colorSemanticTokens.border.subtle,
                    backgroundColor: colorSemanticTokens.surface.card,
                    padding: spacingTokens.sm,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacingTokens.sm,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacingTokens.sm, flex: 1 }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: radiusTokens.pill,
                        backgroundColor: colorSemanticTokens.background.subtle,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text selectable style={{ fontSize: 20, lineHeight: 22 }}>
                        {group.emoji}
                      </Text>
                    </View>
                    <Text
                      selectable
                      numberOfLines={1}
                      style={[typographyScale.headingMd, { color: colorSemanticTokens.text.primary, flex: 1 }]}
                    >
                      {group.name}
                    </Text>
                  </View>
                  <SelectionDot isSelected={isSelected} />
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {showFriends ? (
          <View style={{ gap: spacingTokens.sm }}>
            <Text
              selectable
              style={[typographyScale.headingMd, { color: colorSemanticTokens.text.primary }]}
            >
              Friends
            </Text>

            {isFriendsLoading ? (
              <Text
                selectable
                style={[typographyScale.bodySm, { color: colorSemanticTokens.text.secondary }]}
              >
                Loading friends...
              </Text>
            ) : null}

            {visibleFriends.map((friend) => {
              const isSelected = selectedFriendId === friend.userId;
              const title = getPersonLabel({
                displayName: friend.displayName,
                email: friend.email,
              });

              return (
                <Pressable
                  key={friend.userId}
                  accessibilityRole="button"
                  onPress={() => {
                    setSelectedFriendId(friend.userId);
                    setSelectedGroupId(null);
                  }}
                  style={{
                    borderRadius: radiusTokens.card,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: isSelected
                      ? colorSemanticTokens.accent.primary
                      : colorSemanticTokens.border.subtle,
                    backgroundColor: colorSemanticTokens.surface.card,
                    padding: spacingTokens.sm,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacingTokens.sm,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacingTokens.sm, flex: 1 }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: radiusTokens.pill,
                        backgroundColor: colorSemanticTokens.background.subtle,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        selectable
                        style={[typographyScale.headingSm, { color: colorSemanticTokens.text.secondary }]}
                      >
                        {title.trim().slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        selectable
                        numberOfLines={1}
                        style={[typographyScale.headingMd, { color: colorSemanticTokens.text.primary }]}
                      >
                        {title}
                      </Text>
                      {friend.email ? (
                        <Text
                          selectable
                          numberOfLines={1}
                          style={[typographyScale.bodySm, { color: colorSemanticTokens.text.secondary }]}
                        >
                          {friend.email}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <SelectionDot isSelected={isSelected} />
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {error ? (
          <Text
            selectable
            style={[typographyScale.bodySm, { color: colorSemanticTokens.state.danger }]}
          >
            {error}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
