import { Text, View } from "@/design/primitives/sora-native";

import { LiquidSurface } from "@/design/primitives/liquid-surface";
import { useThemeColors } from "@/providers/theme-provider";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";

type StatTileProps = {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
};

export function StatTile({ label, value, tone = "neutral" }: StatTileProps) {
  const colors = useThemeColors();
  const valueColor =
    tone === "positive"
      ? colors.financial.positive
      : tone === "negative"
        ? colors.financial.negative
        : colors.text.primary;

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
            color: colors.text.secondary,
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
