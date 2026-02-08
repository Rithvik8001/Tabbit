import type { ReactNode } from "react";
import { View } from "react-native";

type GradientOrbBackgroundProps = {
  children: ReactNode;
};

export function GradientOrbBackground({ children }: GradientOrbBackgroundProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {children}
    </View>
  );
}
