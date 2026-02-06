import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colorTokens } from "@/design/tokens/color";

type GradientOrbBackgroundProps = {
  children: ReactNode;
};

export function GradientOrbBackground({ children }: GradientOrbBackgroundProps) {
  const orbOneX = useSharedValue(-18);
  const orbTwoX = useSharedValue(10);
  const orbThreeY = useSharedValue(-10);

  useEffect(() => {
    const timing = {
      duration: 8200,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    };

    orbOneX.value = withRepeat(
      withSequence(withTiming(14, timing), withTiming(-18, timing)),
      -1,
      true
    );
    orbTwoX.value = withRepeat(
      withSequence(withTiming(-16, timing), withTiming(10, timing)),
      -1,
      true
    );
    orbThreeY.value = withRepeat(
      withSequence(withTiming(14, timing), withTiming(-10, timing)),
      -1,
      true
    );
  }, [orbOneX, orbThreeY, orbTwoX]);

  const orbOneStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: orbOneX.value }],
    };
  });

  const orbTwoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: orbTwoX.value }],
    };
  });

  const orbThreeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: orbThreeY.value }],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: colorTokens.surface.base }}>
      <LinearGradient
        colors={["#F8F6FF", "#F7F8FC", "#F0F5FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            top: -130,
            left: -90,
            width: 320,
            height: 320,
            borderRadius: 999,
            backgroundColor: colorTokens.orb.primary,
          },
          orbOneStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 180,
            right: -120,
            width: 290,
            height: 290,
            borderRadius: 999,
            backgroundColor: colorTokens.orb.secondary,
          },
          orbTwoStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: -140,
            left: "18%",
            width: 260,
            height: 260,
            borderRadius: 999,
            backgroundColor: colorTokens.orb.tertiary,
          },
          orbThreeStyle,
        ]}
      />
      {children}
    </View>
  );
}
