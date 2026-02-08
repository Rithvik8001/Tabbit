import type { ReactNode } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";

import { LiquidSurface } from "@/design/primitives/liquid-surface";
import { ScreenScaffold } from "@/design/primitives/screen-scaffold";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";

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
        paddingTop: isCompact ? spacingTokens.sm : spacingTokens.md,
      }}
      footer={footer}
    >
      <Animated.View
        entering={shouldReduceMotion ? undefined : FadeIn.duration(180)}
        style={{
          flex: 1,
          justifyContent: isCompact ? "flex-start" : "center",
          gap: spacingTokens.lg,
        }}
      >
        <View style={{ gap: spacingTokens.xs, maxWidth: 430 }}>
          <Text
            selectable
            style={[
              typographyScale.labelSm,
              {
                color: colorSemanticTokens.text.tertiary,
                textTransform: "uppercase",
                letterSpacing: 0.45,
              },
            ]}
          >
            tabbit / account
          </Text>
          <Text
            selectable
            style={[
              typographyScale.displayMd,
              { color: colorSemanticTokens.text.primary, maxWidth: 360 },
            ]}
          >
            {title}
          </Text>
          <Text
            selectable
            style={[
              typographyScale.bodyMd,
              { color: colorSemanticTokens.text.secondary, maxWidth: 344 },
            ]}
          >
            {subtitle}
          </Text>
        </View>

        <LiquidSurface
          kind="strong"
          blurIntensity={48}
          contentStyle={{
            padding: spacingTokens.lg,
            gap: spacingTokens.md,
          }}
        >
          {children}
        </LiquidSurface>
      </Animated.View>
    </ScreenScaffold>
  );
}
