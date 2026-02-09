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

type ButtonVariant = "solid" | "soft" | "ghost";
type ButtonTone = "accent" | "neutral" | "danger" | "blue";
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getSolidPalette(tone: ButtonTone) {
  switch (tone) {
    case "danger":
      return { bg: colorSemanticTokens.state.danger, text: "#FFFFFF" };
    case "neutral":
      return { bg: colorSemanticTokens.background.subtle, text: colorSemanticTokens.text.primary };
    case "blue":
      return { bg: colorSemanticTokens.state.info, text: "#FFFFFF" };
    case "accent":
    default:
      return { bg: colorSemanticTokens.accent.primary, text: "#FFFFFF" };
  }
}

function getSoftPalette(tone: ButtonTone) {
  switch (tone) {
    case "danger":
      return {
        bg: colorSemanticTokens.state.dangerSoft,
        text: colorSemanticTokens.state.danger,
      };
    case "neutral":
      return {
        bg: colorSemanticTokens.background.subtle,
        text: colorSemanticTokens.text.primary,
      };
    case "blue":
      return {
        bg: colorSemanticTokens.state.infoSoft,
        text: colorSemanticTokens.state.info,
      };
    case "accent":
    default:
      return {
        bg: colorSemanticTokens.accent.soft,
        text: colorSemanticTokens.accent.primary,
      };
  }
}

function getGhostColor(tone: ButtonTone) {
  switch (tone) {
    case "danger":
      return colorSemanticTokens.state.danger;
    case "blue":
      return colorSemanticTokens.state.info;
    case "neutral":
      return colorSemanticTokens.text.primary;
    case "accent":
    default:
      return colorSemanticTokens.accent.primary;
  }
}

function getHeight(size: ButtonSize) {
  if (size === "sm") return 44;
  if (size === "lg") return 62;
  return 52;
}

function getPadding(size: ButtonSize) {
  if (size === "sm") return { paddingVertical: 8, paddingHorizontal: 16 };
  if (size === "lg") return { paddingVertical: 16, paddingHorizontal: 28 };
  return { paddingVertical: 12, paddingHorizontal: 22 };
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

  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    scale.value = withTiming(0.97, {
      duration: shouldReduceMotion ? 0 : motionTokens.duration.press,
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: shouldReduceMotion ? 0 : motionTokens.duration.fast,
    });
  };

  const handlePress = (_event: GestureResponderEvent) => {
    if (isDisabled) return;
    if (isIOS) {
      void Haptics.impactAsync(hapticTokens.press);
    }
    onPress?.();
  };

  const minHeight = getHeight(size);
  const padding = getPadding(size);
  const fontSize = size === "sm" ? 14 : size === "lg" ? 17 : 16;

  if (variant === "solid") {
    const palette = getSolidPalette(tone);
    const resolvedPalette = isDisabled
      ? {
          bg: "#A7A3B0",
          text: "#F3F2F6",
        }
      : palette;

    return (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        onPress={handlePress}
        style={[
          animatedStyle,
          {
            minHeight,
            borderRadius: radiusTokens.pill,
            borderCurve: "continuous",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
            backgroundColor: resolvedPalette.bg,
            opacity: 1,
            boxShadow: isDisabled
              ? "none"
              : "0 8px 18px rgba(57, 19, 138, 0.22)",
            ...padding,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={resolvedPalette.text} />
        ) : null}
        <Text
          selectable
          style={{
            fontSize,
            fontWeight: "700",
            color: resolvedPalette.text,
          }}
        >
          {label}
        </Text>
      </AnimatedPressable>
    );
  }

  if (variant === "ghost") {
    const color = isDisabled ? colorSemanticTokens.text.tertiary : getGhostColor(tone);
    return (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        onPress={handlePress}
        style={[
          animatedStyle,
          {
            minHeight,
            borderRadius: radiusTokens.pill,
            borderCurve: "continuous",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
            opacity: isDisabled ? 0.5 : 1,
            ...padding,
          },
        ]}
      >
        {loading ? <ActivityIndicator size="small" color={color} /> : null}
        <Text
          selectable
          style={{
            fontSize,
            fontWeight: "700",
            color,
          }}
        >
          {label}
        </Text>
      </AnimatedPressable>
    );
  }

  // Soft variant
  const softPalette = isDisabled
    ? { bg: colorSemanticTokens.background.subtle, text: colorSemanticTokens.text.tertiary }
    : getSoftPalette(tone);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      onPress={handlePress}
      style={[
        animatedStyle,
        {
          minHeight,
          borderRadius: radiusTokens.pill,
          borderCurve: "continuous",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          backgroundColor: softPalette.bg,
          opacity: isDisabled ? 0.5 : 1,
          ...padding,
        },
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={softPalette.text} /> : null}
      <Text
        selectable
        style={{
          fontSize,
          fontWeight: "700",
          color: softPalette.text,
        }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
