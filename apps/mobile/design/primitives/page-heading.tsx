import type { ReactNode } from "react";
import { Pressable, Text, View } from "@/design/primitives/sora-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";

type PageHeadingProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  size?: "hero" | "section";
};

type HeaderPillButtonProps = {
  label: string;
  onPress: () => void;
  tone?: "neutral" | "accent";
};

export function HeaderPillButton({
  label,
  onPress,
  tone = "neutral",
}: HeaderPillButtonProps) {
  const isAccent = tone === "accent";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        minHeight: 42,
        borderRadius: radiusTokens.pill,
        borderCurve: "continuous",
        paddingHorizontal: spacingTokens.lg,
        paddingVertical: spacingTokens.sm,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isAccent
          ? colorSemanticTokens.accent.soft
          : colorSemanticTokens.background.subtle,
      }}
    >
      <Text
        selectable
        style={{
          color: isAccent
            ? colorSemanticTokens.accent.primary
            : colorSemanticTokens.text.secondary,
          fontSize: 18,
          lineHeight: 22,
          fontWeight: "700",
          letterSpacing: -0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PageHeading({
  title,
  subtitle,
  leading,
  trailing,
  size = "hero",
}: PageHeadingProps) {
  const titleSize = size === "hero" ? 42 : 34;
  const titleLineHeight = size === "hero" ? 50 : 42;

  return (
    <View style={{ gap: spacingTokens.sm, paddingTop: spacingTokens.xs }}>
      {leading || trailing ? (
        <View
          style={{
            minHeight: 42,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>{leading}</View>
          <View>{trailing}</View>
        </View>
      ) : null}

      <View style={{ gap: spacingTokens.xs }}>
        <Text
          selectable
          style={{
            color: colorSemanticTokens.text.primary,
            fontSize: titleSize,
            lineHeight: titleLineHeight,
            fontWeight: "800",
            letterSpacing: -0.8,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            selectable
            style={{
              color: colorSemanticTokens.text.secondary,
              fontSize: 20,
              lineHeight: 28,
              fontWeight: "500",
              letterSpacing: -0.2,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
