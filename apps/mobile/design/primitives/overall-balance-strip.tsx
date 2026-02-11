import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "@/design/primitives/sora-native";

import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { formatCents } from "@/features/groups/lib/format-currency";

type OverallBalanceStripProps = {
  netBalanceCents: number;
  onFilterPress?: () => void;
};

export function OverallBalanceStrip({
  netBalanceCents,
  onFilterPress,
}: OverallBalanceStripProps) {
  const colors = useThemeColors();
  const isNegative = netBalanceCents < 0;
  const isPositive = netBalanceCents > 0;

  const textPrefix = isPositive
    ? "Overall, you are owed"
    : isNegative
      ? "Overall, you owe"
      : "Overall, you are settled up";

  const amountColor = isPositive
    ? colors.financial.positive
    : isNegative
      ? colors.financial.negative
      : colors.text.secondary;

  const amount = formatCents(Math.abs(netBalanceCents));

  return (
    <View
      style={{
        borderRadius: radiusTokens.card,
        borderCurve: "continuous",
        backgroundColor: colors.surface.card,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        paddingHorizontal: spacingTokens.lg,
        paddingVertical: spacingTokens.md,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: spacingTokens.sm,
      }}
    >
      <Text
        selectable
        style={[
          typographyScale.headingMd,
          { color: colors.text.primary, flex: 1 },
        ]}
      >
        {textPrefix} <Text style={{ color: amountColor }}>{amount}</Text>
      </Text>

      {onFilterPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onFilterPress}
          style={{
            width: 36,
            height: 36,
            borderRadius: radiusTokens.pill,
            borderCurve: "continuous",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background.subtle,
          }}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={colors.text.secondary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
