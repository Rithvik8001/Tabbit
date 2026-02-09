import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "@/design/primitives/sora-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";

type TabTopActionsProps = {
  rightActionLabel?: string;
  onRightActionPress?: () => void;
  onSearchPress?: () => void;
  onFilterPress?: () => void;
};

function IconCircleButton({
  icon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: radiusTokens.pill,
        borderCurve: "continuous",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colorSemanticTokens.surface.card,
        borderWidth: 1,
        borderColor: colorSemanticTokens.border.subtle,
        opacity: onPress ? 1 : 0.6,
      }}
    >
      <Ionicons
        name={icon}
        size={20}
        color={colorSemanticTokens.text.secondary}
      />
    </Pressable>
  );
}

export function TabTopActions({
  rightActionLabel,
  onRightActionPress,
  onSearchPress,
  onFilterPress,
}: TabTopActionsProps) {
  return (
    <View
      style={{
        minHeight: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacingTokens.sm,
      }}
    >
      <IconCircleButton icon="search" onPress={onSearchPress} />

      <View style={{ flexDirection: "row", alignItems: "center", gap: spacingTokens.sm }}>
        {onFilterPress ? <IconCircleButton icon="options-outline" onPress={onFilterPress} /> : null}

        {rightActionLabel && onRightActionPress ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRightActionPress}
            style={{
              borderRadius: radiusTokens.pill,
              borderCurve: "continuous",
              paddingHorizontal: spacingTokens.md,
              minHeight: 40,
              justifyContent: "center",
            }}
          >
            <Text
              selectable
              style={[
                typographyScale.headingSm,
                { color: colorSemanticTokens.accent.primary },
              ]}
            >
              {rightActionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
