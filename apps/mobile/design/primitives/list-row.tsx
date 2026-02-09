import type { ReactNode } from "react";
import { Pressable, Text, View } from "@/design/primitives/sora-native";

import { LiquidSurface } from "@/design/primitives/liquid-surface";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";

type ListRowProps = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  left?: ReactNode;
};

function ListRowContent({
  title,
  subtitle,
  trailing,
  left,
}: Omit<ListRowProps, "onPress">) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacingTokens.sm,
      }}
    >
      {left}
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          selectable
          style={[
            typographyScale.headingSm,
            { color: colorSemanticTokens.text.primary },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            selectable
            style={[
              typographyScale.bodySm,
              { color: colorSemanticTokens.text.tertiary },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

export function ListRow({ onPress, ...props }: ListRowProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          borderRadius: radiusTokens.lg,
          borderCurve: "continuous",
          overflow: "hidden",
        }}
      >
        <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding }}>
          <ListRowContent {...props} />
        </LiquidSurface>
      </Pressable>
    );
  }

  return (
    <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding }}>
      <ListRowContent {...props} />
    </LiquidSurface>
  );
}
