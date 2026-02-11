import { useRouter } from "expo-router";
import { useState } from "react";
import {
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
import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";
import {
  GROUP_DEFAULT_EMOJI_BY_TYPE,
  GROUP_EMOJI_OPTIONS,
  GROUP_TYPE_PRESETS,
} from "@/features/groups/constants/group-presets";
import { useGroups } from "@/features/groups/hooks/use-groups";
import type { GroupType } from "@/features/groups/types/group.types";

const maxGroupNameLength = 40;

export default function CreateGroupScreen() {
  const colors = useThemeColors();
  const stroke = colors.border.subtle;
  const ink = colors.text.primary;
  const muted = colors.text.secondary;
  const accent = colors.accent.primary;
  const router = useRouter();
  const { createGroup, isCreating } = useGroups({ autoRefreshOnFocus: false });
  const [name, setName] = useState("");
  const [groupType, setGroupType] = useState<GroupType>("other");
  const [emoji, setEmoji] = useState(GROUP_DEFAULT_EMOJI_BY_TYPE.other);
  const [hasManuallySelectedEmoji, setHasManuallySelectedEmoji] =
    useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleCreate = () => {
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
      const result = await createGroup({
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
        title="Create Group"
        subtitle="Start a clean split for your next plan."
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
          placeholderTextColor={colors.text.tertiary}
          selectionColor={accent}
          autoFocus
          style={{
            borderRadius: radiusTokens.control,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: stroke,
            backgroundColor: colors.background.subtle,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: ink,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "600",
          }}
        />
      </View>

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
                    ? colors.accent.primary
                    : stroke,
                  backgroundColor: isSelected
                    ? colors.accent.soft
                    : colors.surface.cardStrong,
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

      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: colors.surface.card,
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
              backgroundColor: colors.background.subtle,
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
                    ? colors.accent.primary
                    : stroke,
                  backgroundColor: isSelected
                    ? colors.accent.soft
                    : colors.surface.cardStrong,
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

      {formError ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colors.state.danger,
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
            {formError}
          </Text>
        </View>
      ) : null}

      <Button
        label={isCreating ? "Creating..." : "Create group"}
        onPress={handleCreate}
        disabled={isCreating}
        loading={isCreating}
        size="lg"
      />
    </ScrollView>
  );
}
