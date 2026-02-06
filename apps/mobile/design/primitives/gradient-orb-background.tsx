import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { View } from "react-native";

import { colorTokens } from "@/design/tokens/color";

type GradientOrbBackgroundProps = {
  children: ReactNode;
};

export function GradientOrbBackground({ children }: GradientOrbBackgroundProps) {
  return (
    <View style={{ flex: 1, backgroundColor: colorTokens.surface.base }}>
      <LinearGradient
        colors={["#F9F9FB", colorTokens.surface.base]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />
      <LinearGradient
        colors={["rgba(93, 24, 235, 0.08)", "rgba(93, 24, 235, 0.00)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          left: 0,
          height: 220,
        }}
      />
      {children}
    </View>
  );
}
