import type { ReactNode } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";

import { AdaptiveGlassSurface } from "@/design/primitives/adaptive-glass-surface";
import { ScreenScaffold } from "@/design/primitives/screen-scaffold";
import { colorTokens } from "@/design/tokens/color";
import { motionTokens } from "@/design/tokens/motion";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyTokens } from "@/design/tokens/typography";

type AuthScreenShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthScreenShell({
  title,
  subtitle,
  children,
  footer,
}: AuthScreenShellProps) {
  const shouldReduceMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const isCompact = height < 780;

  return (
    <ScreenScaffold
      footerMode="docked"
      preferViewportFit
      contentContainerStyle={{
        paddingTop: isCompact ? spacingTokens.lg : spacingTokens.xl,
        paddingBottom: isCompact ? spacingTokens.lg : spacingTokens.xl,
      }}
      footer={footer}
    >
      <Animated.View
        entering={
          shouldReduceMotion
            ? undefined
            : FadeIn.duration(motionTokens.duration.transition)
        }
        style={{
          flex: 1,
          justifyContent: isCompact ? "flex-start" : "center",
          gap: isCompact ? spacingTokens.lg : spacingTokens.xl,
        }}
      >
        <View style={{ gap: spacingTokens.lg, maxWidth: 440 }}>
          <View
            style={{
              alignSelf: "flex-start",
              borderRadius: 999,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colorTokens.border.subtle,
              backgroundColor: "rgba(255, 255, 255, 0.72)",
              paddingHorizontal: spacingTokens.md,
              paddingVertical: spacingTokens.sm,
            }}
          >
            <Text
              selectable
              style={[typographyTokens.label, { color: colorTokens.text.secondary }]}
            >
              tabbit
            </Text>
          </View>

          <Text
            selectable
            style={[
              typographyTokens.display,
              {
                color: colorTokens.text.primary,
                fontSize: isCompact ? 30 : typographyTokens.display.fontSize,
                lineHeight: isCompact ? 36 : typographyTokens.display.lineHeight,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            selectable
            style={[
              typographyTokens.body,
              {
                color: colorTokens.text.secondary,
                maxWidth: 360,
              },
            ]}
          >
            {subtitle}
          </Text>
        </View>

        <AdaptiveGlassSurface
          style={{ borderRadius: radiusTokens.card }}
          contentStyle={{
            gap: spacingTokens.lg,
            padding: isCompact ? spacingTokens.lg : spacingTokens.xl,
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
          }}
        >
          {children}
        </AdaptiveGlassSurface>
      </Animated.View>
    </ScreenScaffold>
  );
}
