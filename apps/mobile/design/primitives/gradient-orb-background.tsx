import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { View } from "react-native";

import { colorSemanticTokens } from "@/design/tokens/colors";

type GradientOrbBackgroundProps = {
  children: ReactNode;
};

export function GradientOrbBackground({ children }: GradientOrbBackgroundProps) {
  return (
    <View style={{ flex: 1, backgroundColor: colorSemanticTokens.background.canvas }}>
      <LinearGradient
        colors={[
          colorSemanticTokens.background.gradientStart,
          colorSemanticTokens.background.gradientEnd,
        ]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />
      <LinearGradient
        colors={["rgba(11, 17, 32, 0.06)", "rgba(11, 17, 32, 0.00)"]}
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
        colors={["rgba(50, 87, 226, 0.14)", "rgba(50, 87, 226, 0.00)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          top: -38,
          right: 0,
          left: 0,
          height: 210,
        }}
      />
      {children}
    </View>
  );
}
