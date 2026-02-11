import { Pressable, Text, View } from "@/design/primitives/sora-native";

import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";

type BalanceRowTone = "positive" | "negative" | "neutral";

type BalanceListRowProps = {
  title: string;
  subtitle?: string;
  leadingEmoji?: string;
  leadingText?: string;
  statusLabel: string;
  amountText?: string;
  tone?: BalanceRowTone;
  onPress?: () => void;
};

function statusColor(
  tone: BalanceRowTone,
  colors: ReturnType<typeof useThemeColors>,
): string {
  if (tone === "positive") {
    return colors.financial.positive;
  }

  if (tone === "negative") {
    return colors.financial.negative;
  }

  return colors.text.secondary;
}

export function BalanceListRow({
  title,
  subtitle,
  leadingEmoji,
  leadingText,
  statusLabel,
  amountText,
  tone = "neutral",
  onPress,
}: BalanceListRowProps) {
  const colors = useThemeColors();
  const resolvedStatusColor = statusColor(tone, colors);

  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacingTokens.md,
        paddingHorizontal: spacingTokens.sm,
        paddingVertical: spacingTokens.sm,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radiusTokens.pill,
          borderCurve: "continuous",
          backgroundColor: colors.background.subtle,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {leadingEmoji ? (
          <Text selectable style={{ fontSize: 22, lineHeight: 24 }}>
            {leadingEmoji}
          </Text>
        ) : (
          <Text
            selectable
            style={{
              color: colors.text.secondary,
              fontSize: 16,
              lineHeight: 20,
              fontWeight: "700",
            }}
          >
            {(leadingText ?? title).trim().slice(0, 1).toUpperCase()}
          </Text>
        )}
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text
          selectable
          numberOfLines={1}
          style={[
            typographyScale.headingMd,
            { color: colors.text.primary },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            selectable
            numberOfLines={1}
            style={[
              typographyScale.bodySm,
              { color: colors.text.secondary },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={{ alignItems: "flex-end", gap: 2 }}>
        <Text
          selectable
          style={[typographyScale.bodySm, { color: resolvedStatusColor }]}
        >
          {statusLabel}
        </Text>
        {amountText ? (
          <Text
            selectable
            style={[
              typographyScale.headingMd,
              { color: resolvedStatusColor, fontVariant: ["tabular-nums"] },
            ]}
          >
            {amountText}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        borderRadius: radiusTokens.card,
        borderCurve: "continuous",
      }}
    >
      {content}
    </Pressable>
  );
}
