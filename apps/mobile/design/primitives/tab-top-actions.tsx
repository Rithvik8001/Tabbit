import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "@/design/primitives/sora-native";

import { useThemeColors } from "@/providers/theme-provider";
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
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  colors: ReturnType<typeof useThemeColors>;
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
        backgroundColor: colors.surface.card,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        opacity: onPress ? 1 : 0.6,
      }}
    >
      <Ionicons
        name={icon}
        size={20}
        color={colors.text.secondary}
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
  const colors = useThemeColors();
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
      <IconCircleButton icon="search" onPress={onSearchPress} colors={colors} />

      <View style={{ flexDirection: "row", alignItems: "center", gap: spacingTokens.sm }}>
        {onFilterPress ? (
          <IconCircleButton
            icon="options-outline"
            onPress={onFilterPress}
            colors={colors}
          />
        ) : null}

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
                { color: colors.accent.primary },
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
