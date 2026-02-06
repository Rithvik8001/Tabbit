import * as Haptics from "expo-haptics";
import type { GestureResponderEvent } from "react-native";
import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { premiumAuthUiTokens } from "@/design/tokens/auth-ui";
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
  visualStyle?: "default" | "premiumAuth";
};

const isIOS = process.env.EXPO_OS === "ios";

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = "primary",
  visualStyle = "default",
}: PrimaryButtonProps) {
  const isSecondary = variant === "secondary";
  const isPremiumAuth = visualStyle === "premiumAuth";
  const shouldReduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatePress = (nextScale: number) => {
    scale.value = withTiming(nextScale, {
      duration: shouldReduceMotion
        ? 0
        : isPremiumAuth
          ? premiumAuthUiTokens.motion.pressDuration
          : motionTokens.duration.press,
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
        onPressIn={() =>
          animatePress(
            isPremiumAuth ? premiumAuthUiTokens.motion.pressScale : 0.985,
          )
        }
        onPressOut={() => animatePress(1)}
        onPress={handlePress}
        disabled={disabled}
        style={{
          borderRadius: isPremiumAuth
            ? premiumAuthUiTokens.radius.button
            : radiusTokens.button,
          borderCurve: "continuous",
          borderWidth: 1,
          opacity: disabled ? 0.88 : 1,
          borderColor: isPremiumAuth
            ? isSecondary
              ? premiumAuthUiTokens.color.border
              : disabled
                ? "rgba(17, 20, 26, 0.16)"
                : premiumAuthUiTokens.color.accent
            : isSecondary
              ? colorTokens.border.subtle
              : disabled
                ? "rgba(20, 22, 29, 0.14)"
                : colorTokens.brand.primary,
          backgroundColor: isPremiumAuth
            ? disabled
              ? "rgba(17, 20, 26, 0.08)"
              : isSecondary
                ? premiumAuthUiTokens.color.panel
                : premiumAuthUiTokens.color.accent
            : disabled
              ? "rgba(20, 22, 29, 0.10)"
              : isSecondary
                ? colorTokens.surface.elevated
                : colorTokens.brand.primary,
          paddingVertical: isPremiumAuth ? 12 : spacingTokens.lg,
          paddingHorizontal: isPremiumAuth
            ? premiumAuthUiTokens.spacing.lg
            : spacingTokens.xl,
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isPremiumAuth
            ? isSecondary
              ? premiumAuthUiTokens.shadow.control
              : disabled
                ? "0 0px 0px rgba(0, 0, 0, 0)"
                : premiumAuthUiTokens.shadow.primaryButton
            : isSecondary
              ? "0 6px 14px rgba(20, 22, 29, 0.06)"
              : disabled
                ? "0 0px 0px rgba(0, 0, 0, 0)"
                : "0 10px 18px rgba(20, 22, 29, 0.14)",
        }}
      >
        <Text
          style={
            isPremiumAuth
              ? [
                  premiumAuthUiTokens.typography.button,
                  {
                    color: disabled
                      ? premiumAuthUiTokens.color.textMuted
                      : isSecondary
                        ? premiumAuthUiTokens.color.textPrimary
                        : colorTokens.text.inverse,
                  },
                ]
              : [
                  typographyTokens.label,
                  {
                    color: disabled
                      ? colorTokens.text.muted
                      : isSecondary
                        ? colorTokens.text.primary
                        : colorTokens.text.inverse,
                  },
                ]
          }
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
