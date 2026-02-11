import { Text, View } from "@/design/primitives/sora-native";

import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";

type BadgeProps = {
  label: string;
  tone?: "accent" | "success" | "danger" | "neutral";
};

function getBadgeColors(
  tone: NonNullable<BadgeProps["tone"]>,
  colors: ReturnType<typeof useThemeColors>,
) {
  if (tone === "success") {
    return {
      backgroundColor: colors.state.successSoft,
      color: colors.state.success,
    };
  }

  if (tone === "danger") {
    return {
      backgroundColor: colors.state.dangerSoft,
      color: colors.state.danger,
    };
  }

  if (tone === "accent") {
    return {
      backgroundColor: colors.accent.soft,
      color: colors.accent.primary,
    };
  }

  return {
    backgroundColor: colors.background.subtle,
    color: colors.text.secondary,
  };
}

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const colors = useThemeColors();
  const palette = getBadgeColors(tone, colors);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: radiusTokens.pill,
        borderCurve: "continuous",
        paddingHorizontal: spacingTokens.sm + 2,
        paddingVertical: 4,
        backgroundColor: palette.backgroundColor,
      }}
    >
      <Text
        selectable
        style={[
          typographyScale.caption,
          {
            color: palette.color,
            fontWeight: "600",
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
