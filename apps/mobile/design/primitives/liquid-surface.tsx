import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { elevationTokens } from "@/design/tokens/elevation";
import { glassTokens } from "@/design/tokens/glass";

type SurfaceKind = "default" | "muted" | "strong";

type LiquidSurfaceProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  interactive?: boolean;
  kind?: SurfaceKind;
  blurIntensity?: number;
};

const isIOS = process.env.EXPO_OS === "ios";

function getBackground(kind: SurfaceKind) {
  if (kind === "strong") {
    return colorSemanticTokens.surface.glassStrong;
  }
  if (kind === "muted") {
    return colorSemanticTokens.surface.cardMuted;
  }
  return colorSemanticTokens.surface.glass;
}

export function LiquidSurface({
  children,
  style,
  contentStyle,
  interactive = false,
  kind = "default",
  blurIntensity = glassTokens.fallbackIntensity,
}: LiquidSurfaceProps) {
  const baseStyle: StyleProp<ViewStyle> = [
    {
      overflow: "hidden",
      borderRadius: glassTokens.radius,
      borderCurve: "continuous",
      borderWidth: 1,
      borderColor: glassTokens.borderColor,
      backgroundColor: getBackground(kind),
      boxShadow: elevationTokens.glass,
    },
    style,
  ];

  if (isIOS && isLiquidGlassAvailable()) {
    return (
      <GlassView isInteractive={interactive} style={baseStyle}>
        <View style={contentStyle}>{children}</View>
      </GlassView>
    );
  }

  if (isIOS) {
    return (
      <BlurView
        tint="systemMaterialLight"
        intensity={blurIntensity}
        style={baseStyle}
      >
        <View style={contentStyle}>{children}</View>
      </BlurView>
    );
  }

  return (
    <View style={baseStyle}>
      <View style={contentStyle}>{children}</View>
    </View>
  );
}
