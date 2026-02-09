import { Text, View } from "react-native";

import { LiquidSurface } from "@/design/primitives/liquid-surface";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";

type StatTileProps = {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
};

export function StatTile({ label, value, tone = "neutral" }: StatTileProps) {
  const valueColor =
    tone === "positive"
      ? colorSemanticTokens.financial.positive
      : tone === "negative"
        ? colorSemanticTokens.financial.negative
        : colorSemanticTokens.text.primary;

  return (
    <LiquidSurface
      contentStyle={{
        padding: spacingTokens.cardPadding,
        gap: spacingTokens.xs,
      }}
    >
      <Text
        selectable
        style={[
          typographyScale.labelSm,
          {
            color: colorSemanticTokens.text.secondary,
            fontWeight: "500",
          },
        ]}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          gap: spacingTokens.xxs,
        }}
      >
        <Text
          selectable
          style={[
            typographyScale.headingMd,
            { color: valueColor, fontVariant: ["tabular-nums"] },
          ]}
        >
          {value}
        </Text>
      </View>
    </LiquidSurface>
  );
}
