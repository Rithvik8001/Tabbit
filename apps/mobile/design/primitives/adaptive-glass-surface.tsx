import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

import { colorTokens } from "@/design/tokens/color";

type AdaptiveGlassSurfaceProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  interactive?: boolean;
  blurIntensity?: number;
};

const isIOS = process.env.EXPO_OS === "ios";

export function AdaptiveGlassSurface({
  children,
  style,
  contentStyle,
  interactive = false,
  blurIntensity = 90,
}: AdaptiveGlassSurfaceProps) {
  const baseStyle: StyleProp<ViewStyle> = [
    {
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colorTokens.border.glass,
      backgroundColor: "rgba(255, 255, 255, 0.58)",
      boxShadow: "0 8px 22px rgba(20, 22, 29, 0.08)",
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
        tint="systemMaterial"
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
