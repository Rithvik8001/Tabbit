import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

import { LiquidSurface } from "@/design/primitives/liquid-surface";
import { spacingTokens } from "@/design/tokens/spacing";

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
};

export function GlassCard({
  children,
  style,
  contentStyle,
  intensity = 44,
}: GlassCardProps) {
  return (
    <LiquidSurface
      style={style}
      blurIntensity={intensity}
      contentStyle={[
        {
          padding: spacingTokens.xl,
        },
        contentStyle,
      ]}
    >
      <View>
        <View
          style={{
            borderRadius: 0,
            borderCurve: "continuous",
          }}
        >
          {children}
        </View>
      </View>
    </LiquidSurface>
  );
}
