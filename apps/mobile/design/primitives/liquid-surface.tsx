import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "@/design/primitives/sora-native";
import { View } from "@/design/primitives/sora-native";

import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";

type LiquidSurfaceProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  interactive?: boolean;
  kind?: "default" | "muted" | "strong";
  blurIntensity?: number;
};

export function LiquidSurface({
  children,
  style,
  contentStyle,
  interactive: _interactive = false,
  kind: _kind = "default",
  blurIntensity: _blurIntensity,
}: LiquidSurfaceProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          overflow: "hidden",
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: colors.surface.card,
        },
        style,
      ]}
    >
      <View style={contentStyle}>{children}</View>
    </View>
  );
}
