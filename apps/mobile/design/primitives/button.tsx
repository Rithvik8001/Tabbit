import * as Haptics from "expo-haptics";
import type { GestureResponderEvent } from "react-native";
import { ActivityIndicator, Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { hapticTokens } from "@/design/tokens/haptics";
import { motionTokens } from "@/design/tokens/motion";
import { radiusTokens } from "@/design/tokens/radius";
import { typographyScale } from "@/design/tokens/typography";

type ButtonVariant = "solid" | "soft" | "ghost";
type ButtonTone = "accent" | "neutral" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
};

const isIOS = process.env.EXPO_OS === "ios";

function getPalette(variant: ButtonVariant, tone: ButtonTone, disabled: boolean) {
  if (disabled) {
    return {
      backgroundColor: "rgba(11, 17, 32, 0.06)",
      borderColor: "rgba(11, 17, 32, 0.10)",
      color: colorSemanticTokens.text.tertiary,
    };
  }

  if (variant === "ghost") {
    return {
      backgroundColor: "transparent",
      borderColor: "transparent",
      color:
        tone === "danger"
          ? colorSemanticTokens.state.danger
          : tone === "accent"
            ? colorSemanticTokens.accent.primary
            : colorSemanticTokens.text.primary,
    };
  }

  if (variant === "soft") {
    return {
      backgroundColor:
        tone === "danger"
          ? colorSemanticTokens.state.dangerSoft
          : tone === "accent"
            ? colorSemanticTokens.accent.soft
            : "rgba(11, 17, 32, 0.08)",
      borderColor:
        tone === "danger"
          ? "rgba(188, 43, 62, 0.24)"
          : tone === "accent"
            ? colorSemanticTokens.border.accent
            : colorSemanticTokens.border.subtle,
      color:
        tone === "danger"
          ? colorSemanticTokens.state.danger
          : tone === "accent"
            ? colorSemanticTokens.accent.primary
            : colorSemanticTokens.text.primary,
    };
  }

  return {
    backgroundColor:
      tone === "danger" ? colorSemanticTokens.state.danger : colorSemanticTokens.accent.primary,
    borderColor:
      tone === "danger" ? colorSemanticTokens.state.danger : colorSemanticTokens.accent.primary,
    color: colorSemanticTokens.text.inverse,
  };
}

function getSizeStyles(size: ButtonSize) {
  if (size === "sm") {
    return { paddingVertical: 8, paddingHorizontal: 12 };
  }
  if (size === "lg") {
    return { paddingVertical: 14, paddingHorizontal: 18 };
  }
  return { paddingVertical: 12, paddingHorizontal: 16 };
}

export function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "solid",
  tone = "accent",
  size = "md",
}: ButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatePress = (to: number) => {
    scale.value = withTiming(to, {
      duration: shouldReduceMotion ? 0 : motionTokens.duration.press,
    });
  };

  const palette = getPalette(variant, tone, disabled || loading);
  const sizeStyles = getSizeStyles(size);

  const handlePress = (_event: GestureResponderEvent) => {
    if (disabled || loading) {
      return;
    }

    if (isIOS) {
      void Haptics.impactAsync(hapticTokens.press);
    }

    onPress?.();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        onPressIn={() => animatePress(0.985)}
        onPressOut={() => animatePress(1)}
        disabled={disabled || loading}
        onPress={handlePress}
        style={{
          minHeight: 44,
          borderRadius: radiusTokens.button,
          borderCurve: "continuous",
          borderWidth: variant === "ghost" ? 0 : 1,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          ...sizeStyles,
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        }}
      >
        {loading ? <ActivityIndicator size="small" color={palette.color} /> : null}
        <Text
          selectable
          style={[typographyScale.labelLg, { color: palette.color, fontVariant: ["tabular-nums"] }]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
