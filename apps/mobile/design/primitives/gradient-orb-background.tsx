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
        colors={["#F5F6F8", "#F2F4F7"]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />
      <LinearGradient
        colors={["rgba(16, 20, 30, 0.035)", "rgba(16, 20, 30, 0.00)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.8 }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          left: 0,
          height: 200,
        }}
      />
      <LinearGradient
        colors={["rgba(93, 24, 235, 0.028)", "rgba(93, 24, 235, 0.00)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          top: -30,
          right: 0,
          left: 0,
          height: 170,
        }}
      />
      {children}
    </View>
  );
}
