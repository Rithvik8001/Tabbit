import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

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
  return (
    <View
      style={[
        {
          overflow: "hidden",
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: "#FFFFFF",
        },
        style,
      ]}
    >
      <View style={contentStyle}>{children}</View>
    </View>
  );
}
