import type { ReactNode } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";

import { AdaptiveGlassSurface } from "@/design/primitives/adaptive-glass-surface";
import { ScreenScaffold } from "@/design/primitives/screen-scaffold";
import { premiumAuthUiTokens } from "@/design/tokens/auth-ui";

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
        paddingTop: isCompact
          ? premiumAuthUiTokens.spacing.sm
          : premiumAuthUiTokens.spacing.md,
        paddingBottom: isCompact
          ? premiumAuthUiTokens.spacing.sm
          : premiumAuthUiTokens.spacing.md,
      }}
      footerStyle={{
        backgroundColor: premiumAuthUiTokens.color.floatingBar,
        borderTopColor: premiumAuthUiTokens.color.divider,
      }}
      footer={footer}
    >
      <Animated.View
        entering={
          shouldReduceMotion
            ? undefined
            : FadeIn.duration(premiumAuthUiTokens.motion.screenEnterDuration)
        }
        style={{
          flex: 1,
          justifyContent: isCompact ? "flex-start" : "center",
          gap: isCompact
            ? premiumAuthUiTokens.spacing.md
            : premiumAuthUiTokens.spacing.lg,
        }}
      >
        <View
          style={{
            gap: premiumAuthUiTokens.spacing.sm,
            maxWidth: 430,
          }}
        >
          <View style={{ gap: premiumAuthUiTokens.spacing.xs }}>
            <Text
              selectable
              style={[
                premiumAuthUiTokens.typography.eyebrow,
                {
                  color: premiumAuthUiTokens.color.textMuted,
                  textTransform: "uppercase",
                },
              ]}
            >
              tabbit / access
            </Text>
            <View
              style={{
                width: 30,
                height: 1,
                backgroundColor: premiumAuthUiTokens.color.divider,
              }}
            />
          </View>

          <Text
            selectable
            style={[
              premiumAuthUiTokens.typography.title,
              {
                color: premiumAuthUiTokens.color.textPrimary,
                fontSize: isCompact
                  ? 27
                  : premiumAuthUiTokens.typography.title.fontSize,
                lineHeight: isCompact
                  ? 32
                  : premiumAuthUiTokens.typography.title.lineHeight,
                maxWidth: 360,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            selectable
            style={[
              premiumAuthUiTokens.typography.subtitle,
              {
                color: premiumAuthUiTokens.color.textSecondary,
                maxWidth: 338,
              },
            ]}
          >
            {subtitle}
          </Text>
        </View>

        <AdaptiveGlassSurface
          blurIntensity={42}
          style={{
            borderRadius: premiumAuthUiTokens.radius.panel,
            borderColor: premiumAuthUiTokens.color.border,
            boxShadow: premiumAuthUiTokens.shadow.panel,
          }}
          contentStyle={{
            gap: premiumAuthUiTokens.spacing.md,
            padding: isCompact
              ? premiumAuthUiTokens.spacing.md
              : premiumAuthUiTokens.spacing.lg,
            borderRadius: premiumAuthUiTokens.radius.panel,
            borderCurve: "continuous",
            backgroundColor: premiumAuthUiTokens.color.panel,
          }}
        >
          {children}
        </AdaptiveGlassSurface>
      </Animated.View>
    </ScreenScaffold>
  );
}
