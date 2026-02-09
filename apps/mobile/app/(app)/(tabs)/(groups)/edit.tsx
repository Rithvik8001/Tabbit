import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
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
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import {
  GROUP_DEFAULT_EMOJI_BY_TYPE,
  GROUP_EMOJI_OPTIONS,
  GROUP_TYPE_PRESETS,
} from "@/features/groups/constants/group-presets";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";
import type { GroupType } from "@/features/groups/types/group.types";

const stroke = colorSemanticTokens.border.subtle;
const ink = colorSemanticTokens.text.primary;
const muted = colorSemanticTokens.text.secondary;
const accent = colorSemanticTokens.accent.primary;
const maxGroupNameLength = 40;

export default function EditGroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { group, updateGroup, deleteGroup, isUpdating, isDeleting } =
    useGroupDetail(id);

  const [name, setName] = useState(group?.name ?? "");
  const [groupType, setGroupType] = useState<GroupType>(
    group?.groupType ?? "other",
  );
  const [emoji, setEmoji] = useState(
    group?.emoji ?? GROUP_DEFAULT_EMOJI_BY_TYPE.other,
  );
  const [hasManuallySelectedEmoji, setHasManuallySelectedEmoji] =
    useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const hydratedGroupIdRef = useRef<string | null>(null);

  useEffect(() => {
    hydratedGroupIdRef.current = null;
  }, [id]);

  useEffect(() => {
    if (!group) {
      return;
    }

    if (hydratedGroupIdRef.current === group.id) {
      return;
    }

    setName(group.name);
    setGroupType(group.groupType);
    setEmoji(group.emoji);
    hydratedGroupIdRef.current = group.id;
  }, [group]);

  const handleSelectType = (nextType: GroupType) => {
    setGroupType(nextType);

    if (!hasManuallySelectedEmoji) {
      setEmoji(GROUP_DEFAULT_EMOJI_BY_TYPE[nextType]);
    }
  };

  const handleSelectEmoji = (nextEmoji: string) => {
    setEmoji(nextEmoji);
    setHasManuallySelectedEmoji(true);
  };

  const handleSave = () => {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      setFormError("Group name is required.");
      return;
    }

    if (trimmedName.length > maxGroupNameLength) {
      setFormError("Group name can be at most 40 characters.");
      return;
    }

    if (emoji.trim().length === 0) {
      setFormError("Pick an emoji for this group.");
      return;
    }

    setFormError(null);

    void (async () => {
      const result = await updateGroup({
        name: trimmedName,
        emoji,
        groupType,
      });

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      router.back();
    })();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              const result = await deleteGroup();
              if (result.ok) {
                router.dismiss(2);
              } else {
                Alert.alert("Error", result.message);
              }
            })();
          },
        },
      ],
    );
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
        title="Edit Group"
        subtitle="Update the group details and vibe."
        leading={
          <HeaderPillButton label="Back" onPress={() => router.back()} />
        }
      />

      {/* Group name */}
      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: colorSemanticTokens.surface.card,
          padding: 16,
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
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
            Group name
          </Text>
          <Text
            selectable
            style={{
              color: muted,
              fontSize: 13,
              lineHeight: 16,
              fontWeight: "600",
            }}
          >
            {name.trim().length}/{maxGroupNameLength}
          </Text>
        </View>

        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={maxGroupNameLength}
          placeholder="e.g. Summer in Tokyo"
          placeholderTextColor={colorSemanticTokens.text.tertiary}
          selectionColor={accent}
          style={{
            borderRadius: radiusTokens.control,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: stroke,
            backgroundColor: colorSemanticTokens.background.subtle,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: ink,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "600",
          }}
        />
      </View>

      {/* Group type */}
      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: colorSemanticTokens.surface.card,
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
          Group type
        </Text>

        <View style={{ gap: 8 }}>
          {GROUP_TYPE_PRESETS.map((preset) => {
            const isSelected = preset.type === groupType;

            return (
              <Pressable
                key={preset.type}
                onPress={() => handleSelectType(preset.type)}
                style={{
                  borderRadius: radiusTokens.control,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: isSelected
                    ? colorSemanticTokens.accent.primary
                    : stroke,
                  backgroundColor: isSelected
                    ? colorSemanticTokens.accent.soft
                    : colorSemanticTokens.surface.cardStrong,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  gap: 4,
                }}
              >
                <Text
                  selectable
                  style={{
                    color: isSelected ? accent : ink,
                    fontSize: 16,
                    lineHeight: 20,
                    fontWeight: "600",
                  }}
                >
                  {preset.label}
                </Text>
                <Text
                  selectable
                  style={{
                    color: muted,
                    fontSize: 13,
                    lineHeight: 16,
                    fontWeight: "500",
                  }}
                >
                  {preset.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Group emoji */}
      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: colorSemanticTokens.surface.card,
          padding: 16,
          gap: 12,
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
          <Text
            selectable
            style={{
              color: ink,
              fontSize: 18,
              lineHeight: 22,
              fontWeight: "600",
            }}
          >
            Group emoji
          </Text>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              borderCurve: "continuous",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colorSemanticTokens.background.subtle,
            }}
          >
            <Text selectable style={{ fontSize: 18, lineHeight: 22 }}>
              {emoji}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {GROUP_EMOJI_OPTIONS.map((option) => {
            const isSelected = option === emoji;

            return (
              <Pressable
                key={option}
                onPress={() => handleSelectEmoji(option)}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: radiusTokens.control,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: isSelected
                    ? colorSemanticTokens.accent.primary
                    : stroke,
                  backgroundColor: isSelected
                    ? colorSemanticTokens.accent.soft
                    : colorSemanticTokens.surface.cardStrong,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text selectable style={{ fontSize: 22, lineHeight: 24 }}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Error display */}
      {formError ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colorSemanticTokens.state.danger,
            backgroundColor: colorSemanticTokens.state.dangerSoft,
            padding: 12,
          }}
        >
          <Text
            selectable
            style={{
              color: colorSemanticTokens.state.danger,
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "600",
            }}
          >
            {formError}
          </Text>
        </View>
      ) : null}

      {/* Save button */}
      <Button
        label={isUpdating ? "Saving..." : "Save changes"}
        onPress={handleSave}
        disabled={isUpdating}
        loading={isUpdating}
        size="lg"
      />

      {/* Delete button */}
      <Button
        label={isDeleting ? "Deleting..." : "Delete group"}
        onPress={handleDelete}
        disabled={isDeleting}
        loading={isDeleting}
        variant="soft"
        tone="danger"
        size="lg"
      />
    </ScrollView>
  );
}
