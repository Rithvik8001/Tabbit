import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colorTokens } from "@/design/tokens/color";
import { motionTokens } from "@/design/tokens/motion";
import { spacingTokens } from "@/design/tokens/spacing";

type ProgressDotsProps = {
  currentIndex: number;
  total: number;
};

type ProgressDotProps = {
  isActive: boolean;
};

function ProgressDot({ isActive }: ProgressDotProps) {
  const shouldReduceMotion = useReducedMotion();
  const dotWidth = useSharedValue(isActive ? 20 : 7);

  useEffect(() => {
    dotWidth.value = withTiming(isActive ? 20 : 7, {
      duration: shouldReduceMotion ? 0 : motionTokens.duration.transition,
    });
  }, [dotWidth, isActive, shouldReduceMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: dotWidth.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 999,
          backgroundColor: isActive
            ? colorTokens.brand.primary
            : "rgba(20, 22, 29, 0.16)",
        },
        animatedStyle,
      ]}
    />
  );
}

export function ProgressDots({ currentIndex, total }: ProgressDotsProps) {
  const dots = Array.from({ length: total }, (_, index) => index);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacingTokens.sm }}>
      {dots.map((index) => {
        return <ProgressDot key={index} isActive={currentIndex === index} />;
      })}
    </View>
  );
}
