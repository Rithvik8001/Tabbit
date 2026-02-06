import * as Haptics from "expo-haptics";
import type { GestureResponderEvent } from "react-native";
import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colorTokens } from "@/design/tokens/color";
import { motionTokens } from "@/design/tokens/motion";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyTokens } from "@/design/tokens/typography";

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

const isIOS = process.env.EXPO_OS === "ios";

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = "primary",
}: PrimaryButtonProps) {
  const isSecondary = variant === "secondary";
  const shouldReduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatePress = (nextScale: number) => {
    scale.value = withTiming(nextScale, {
      duration: shouldReduceMotion ? 0 : motionTokens.duration.press,
    });
  };

  const handlePress = (_event: GestureResponderEvent) => {
    if (disabled) {
      return;
    }

    if (isIOS) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress?.();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        onPressIn={() => animatePress(0.985)}
        onPressOut={() => animatePress(1)}
        onPress={handlePress}
        disabled={disabled}
        style={{
          borderRadius: radiusTokens.button,
          borderCurve: "continuous",
          borderWidth: 1,
          opacity: disabled ? 0.88 : 1,
          borderColor: isSecondary
            ? colorTokens.border.subtle
            : disabled
              ? "rgba(20, 22, 29, 0.14)"
              : colorTokens.brand.primary,
          backgroundColor: disabled
            ? "rgba(20, 22, 29, 0.10)"
            : isSecondary
              ? colorTokens.surface.elevated
              : colorTokens.brand.primary,
          paddingVertical: spacingTokens.lg,
          paddingHorizontal: spacingTokens.xl,
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isSecondary
            ? "0 6px 14px rgba(20, 22, 29, 0.06)"
            : disabled
              ? "0 0px 0px rgba(0, 0, 0, 0)"
              : "0 10px 18px rgba(20, 22, 29, 0.14)",
        }}
      >
        <Text
          style={[
            typographyTokens.label,
            {
              color: disabled
                ? colorTokens.text.muted
                : isSecondary
                  ? colorTokens.text.primary
                  : colorTokens.text.inverse,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
