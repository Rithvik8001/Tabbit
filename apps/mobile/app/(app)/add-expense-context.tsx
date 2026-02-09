import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, TextInput, View } from "@/design/primitives/sora-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useFriends } from "@/features/friends/hooks/use-friends";
import { ensureDirectFriendGroup } from "@/features/friends/lib/friend-requests-repository";
import { useGroups } from "@/features/groups/hooks/use-groups";

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

type ReturnTab = "friends" | "groups";

export default function AddExpenseContextScreen() {
  const router = useRouter();
  const { groups, isLoading: isGroupsLoading } = useGroups();
  const { friends, isLoading: isFriendsLoading } = useFriends();

  const [query, setQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const visibleGroups = useMemo(() => {
    if (!normalizedQuery) {
      return groups;
    }

    return groups.filter((group) =>
      group.name.toLowerCase().includes(normalizedQuery),
    );
  }, [groups, normalizedQuery]);

  const visibleFriends = useMemo(() => {
    if (!normalizedQuery) {
      return friends;
    }

    return friends.filter((friend) => {
      const title = (friend.displayName ?? friend.email ?? "").toLowerCase();
      return title.includes(normalizedQuery);
    });
  }, [friends, normalizedQuery]);

  const openExpenseForm = (groupId: string, returnTab: ReturnTab) => {
    const tabRoute =
      returnTab === "groups"
        ? "/(app)/(tabs)/(groups)"
        : "/(app)/(tabs)/(friends)";

    // Ensure the underlying tab route is the back target before opening add-expense.
    router.dismissTo(tabRoute);

    // Queue the modal push for the next frame after tab transition settles.
    requestAnimationFrame(() => {
      router.push({
        pathname: "/(app)/(tabs)/(groups)/add-expense",
        params: { id: groupId, returnTab },
      });
    });
  };

  const handleSave = () => {
    if (isSubmitting) {
      return;
    }

    setError(null);

    if (!selectedGroupId && !selectedFriendId) {
      setError("Choose one group or one friend.");
      return;
    }

    setIsSubmitting(true);

    void (async () => {
      if (selectedGroupId) {
        openExpenseForm(selectedGroupId, "groups");
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

      openExpenseForm(directGroupResult.data, "friends");
    })();
  };

  const isDisabled = isSubmitting || (!selectedGroupId && !selectedFriendId);

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
              {isSubmitting ? "Saving..." : "Save"}
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
            placeholder="Enter names or emails"
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
            const title = friend.displayName ?? friend.email ?? "Unknown";

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
