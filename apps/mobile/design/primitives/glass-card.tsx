import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

import { colorTokens } from "@/design/tokens/color";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
};

const isIOS = process.env.EXPO_OS === "ios";

export function GlassCard({
  children,
  style,
  contentStyle,
  intensity = 36,
}: GlassCardProps) {
  return (
    <View
      style={[
        {
          overflow: "hidden",
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colorTokens.border.glass,
          boxShadow: "0 18px 40px rgba(93, 24, 235, 0.10)",
        },
        style,
      ]}
    >
      {isIOS ? (
        <BlurView intensity={intensity} tint="light">
          <View
            style={[
              {
                padding: spacingTokens.xl,
                backgroundColor: "rgba(255, 255, 255, 0.36)",
              },
              contentStyle,
            ]}
          >
            {children}
          </View>
        </BlurView>
      ) : (
        <View
          style={[
            {
              padding: spacingTokens.xl,
              backgroundColor: colorTokens.surface.glass,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}
