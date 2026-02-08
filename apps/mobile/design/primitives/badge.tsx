import { Text, View } from "react-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";

type BadgeProps = {
  label: string;
  tone?: "accent" | "success" | "danger" | "neutral";
};

function getBadgeColors(tone: NonNullable<BadgeProps["tone"]>) {
  if (tone === "success") {
    return {
      backgroundColor: colorSemanticTokens.state.successSoft,
      color: colorSemanticTokens.state.success,
    };
  }

  if (tone === "danger") {
    return {
      backgroundColor: colorSemanticTokens.state.dangerSoft,
      color: colorSemanticTokens.state.danger,
    };
  }

  if (tone === "accent") {
    return {
      backgroundColor: colorSemanticTokens.accent.soft,
      color: colorSemanticTokens.accent.primary,
    };
  }

  return {
    backgroundColor: "rgba(11, 17, 32, 0.08)",
    color: colorSemanticTokens.text.secondary,
  };
}

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const palette = getBadgeColors(tone);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: radiusTokens.pill,
        borderCurve: "continuous",
        paddingHorizontal: spacingTokens.sm,
        paddingVertical: 3,
        backgroundColor: palette.backgroundColor,
      }}
    >
      <Text selectable style={[typographyScale.caption, { color: palette.color }]}>
        {label}
      </Text>
    </View>
  );
}
