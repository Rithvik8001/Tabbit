import { type ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenContainer } from "@/design/primitives/screen-container";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";

type ScreenScaffoldProps = {
  children: ReactNode;
  footer?: ReactNode;
  withOrbBackground?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  footerMode?: "overlay" | "docked" | "floating";
  preferViewportFit?: boolean;
};

export function ScreenScaffold({
  children,
  footer,
  withOrbBackground = true,
  contentContainerStyle,
  footerStyle,
  footerMode = "overlay",
}: ScreenScaffoldProps) {
  const insets = useSafeAreaInsets();

  if (!footer || footerMode === "docked") {
    return (
      <ScreenContainer
        withBackground={withOrbBackground}
        contentContainerStyle={contentContainerStyle}
        footer={footer}
      >
        {children}
      </ScreenContainer>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer
        withBackground={withOrbBackground}
        contentContainerStyle={[
          {
            paddingBottom: footerMode === "floating" ? 128 : 120,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScreenContainer>
      <View
        style={[
          {
            position: "absolute",
            left: footerMode === "floating" ? spacingTokens.screenHorizontal : 0,
            right: footerMode === "floating" ? spacingTokens.screenHorizontal : 0,
            bottom: footerMode === "floating" ? Math.max(insets.bottom, 8) : 0,
            borderTopWidth: footerMode === "floating" ? 0 : 1,
            borderTopColor: colorSemanticTokens.border.subtle,
            backgroundColor:
              footerMode === "floating"
                ? colorSemanticTokens.background.chrome
                : "rgba(248, 250, 253, 0.94)",
            borderRadius: footerMode === "floating" ? radiusTokens.lg : 0,
            borderCurve: "continuous",
            paddingHorizontal: spacingTokens.screenHorizontal,
            paddingVertical: spacingTokens.sm,
            boxShadow: footerMode === "floating" ? "0 10px 20px rgba(9, 14, 26, 0.10)" : undefined,
          },
          footerStyle,
        ]}
      >
        {footer}
      </View>
    </View>
  );
}
