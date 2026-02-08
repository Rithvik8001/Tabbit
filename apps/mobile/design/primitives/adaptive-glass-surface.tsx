import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { LiquidSurface } from "@/design/primitives/liquid-surface";

type AdaptiveGlassSurfaceProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  interactive?: boolean;
  blurIntensity?: number;
};

export function AdaptiveGlassSurface({
  children,
  style,
  contentStyle,
  interactive = false,
  blurIntensity = 90,
}: AdaptiveGlassSurfaceProps) {
  return (
    <LiquidSurface
      style={style}
      contentStyle={contentStyle}
      interactive={interactive}
      blurIntensity={blurIntensity}
    >
      {children}
    </LiquidSurface>
  );
}
