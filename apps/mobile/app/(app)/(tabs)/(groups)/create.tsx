import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import {
  GROUP_DEFAULT_EMOJI_BY_TYPE,
  GROUP_EMOJI_OPTIONS,
  GROUP_TYPE_PRESETS,
} from "@/features/groups/constants/group-presets";
import { useGroups } from "@/features/groups/hooks/use-groups";
import type { GroupType } from "@/features/groups/types/group.types";

const stroke = colorSemanticTokens.border.subtle;
const ink = colorSemanticTokens.text.primary;
const muted = colorSemanticTokens.text.secondary;
const accent = colorSemanticTokens.accent.primary;
const maxGroupNameLength = 40;

export default function CreateGroupScreen() {
  const router = useRouter();
  const { createGroup, isCreating } = useGroups({ autoRefreshOnFocus: false });
  const [name, setName] = useState("");
  const [groupType, setGroupType] = useState<GroupType>("other");
  const [emoji, setEmoji] = useState(GROUP_DEFAULT_EMOJI_BY_TYPE.other);
  const [hasManuallySelectedEmoji, setHasManuallySelectedEmoji] = useState(false);
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
      <View
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          borderWidth: 2,
          borderColor: "#E5E5E5",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
            style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
          >
            Group name
          </Text>
          <Text
            selectable
            style={{ color: muted, fontSize: 13, lineHeight: 16, fontWeight: "600" }}
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
          autoFocus
          style={{
            borderRadius: 16,
            borderCurve: "continuous",
            borderWidth: 2,
            borderColor: "#E5E5E5",
            backgroundColor: "#FFFFFF",
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
          borderRadius: 16,
          borderCurve: "continuous",
          borderWidth: 2,
          borderColor: "#E5E5E5",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
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
                  borderRadius: 16,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: isSelected ? colorSemanticTokens.accent.primary : stroke,
                  backgroundColor: isSelected ? colorSemanticTokens.accent.soft : colorSemanticTokens.surface.cardStrong,
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
                    fontWeight: "700",
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
          borderRadius: 16,
          borderCurve: "continuous",
          borderWidth: 2,
          borderColor: "#E5E5E5",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
            style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
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
                  borderRadius: 12,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: isSelected ? colorSemanticTokens.accent.primary : stroke,
                  backgroundColor: isSelected ? colorSemanticTokens.accent.soft : colorSemanticTokens.surface.cardStrong,
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
            borderRadius: 16,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colorSemanticTokens.state.danger,
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
        disabled={isCreating}
        onPress={handleCreate}
        style={{
          borderRadius: 16,
          borderCurve: "continuous",
          backgroundColor: isCreating ? colorSemanticTokens.accent.softStrong : accent,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
          opacity: isCreating ? 0.8 : 1,
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
          {isCreating ? "Creating..." : "Create Group"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
