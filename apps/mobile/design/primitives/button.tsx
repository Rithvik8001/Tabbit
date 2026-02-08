import * as Haptics from "expo-haptics";
import type { GestureResponderEvent } from "react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
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

const SHADOW_HEIGHT = 4;

type SolidPalette = {
  face: string;
  shadow: string;
  text: string;
};

function getSolidPalette(tone: ButtonTone): SolidPalette {
  switch (tone) {
    case "danger":
      return { face: "#FF4B4B", shadow: "#EA2B2B", text: "#FFFFFF" };
    case "neutral":
      return { face: "#E5E5E5", shadow: "#CCCCCC", text: "#3C3C3C" };
    case "blue":
      return { face: "#1CB0F6", shadow: "#1899D6", text: "#FFFFFF" };
    case "accent":
    default:
      return { face: "#58CC02", shadow: "#46A302", text: "#FFFFFF" };
  }
}

function getSoftPalette(tone: ButtonTone) {
  switch (tone) {
    case "danger":
      return {
        backgroundColor: colorSemanticTokens.state.dangerSoft,
        borderColor: "#FF4B4B",
        color: "#FF4B4B",
      };
    case "neutral":
      return {
        backgroundColor: "#F7F7F7",
        borderColor: "#E5E5E5",
        color: "#3C3C3C",
      };
    case "blue":
      return {
        backgroundColor: colorSemanticTokens.state.infoSoft,
        borderColor: "#1CB0F6",
        color: "#1CB0F6",
      };
    case "accent":
    default:
      return {
        backgroundColor: colorSemanticTokens.accent.soft,
        borderColor: "#58CC02",
        color: "#58CC02",
      };
  }
}

function getGhostColor(tone: ButtonTone) {
  switch (tone) {
    case "danger":
      return "#FF4B4B";
    case "blue":
      return "#1CB0F6";
    case "neutral":
      return "#3C3C3C";
    case "accent":
    default:
      return "#58CC02";
  }
}

function getSizeStyles(size: ButtonSize) {
  if (size === "sm") {
    return { paddingVertical: 8, paddingHorizontal: 14 };
  }
  if (size === "lg") {
    return { paddingVertical: 14, paddingHorizontal: 20 };
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
  const translateY = useSharedValue(0);

  const animatedFaceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatePress = (pressed: boolean) => {
    translateY.value = withTiming(pressed ? SHADOW_HEIGHT : 0, {
      duration: shouldReduceMotion ? 0 : motionTokens.duration.press,
    });
  };

  const isDisabled = disabled || loading;

  const handlePress = (_event: GestureResponderEvent) => {
    if (isDisabled) return;
    if (isIOS) {
      void Haptics.impactAsync(hapticTokens.press);
    }
    onPress?.();
  };

  // Solid 3D button
  if (variant === "solid") {
    const palette = getSolidPalette(tone);
    const minH = size === "lg" ? 50 : size === "sm" ? 36 : 44;
    const sizeStyles = getSizeStyles(size);

    return (
      <View
        style={{
          borderRadius: radiusTokens.button,
          borderCurve: "continuous",
          overflow: "hidden",
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        {/* Shadow layer */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: SHADOW_HEIGHT,
            backgroundColor: palette.shadow,
            borderBottomLeftRadius: radiusTokens.button,
            borderBottomRightRadius: radiusTokens.button,
          }}
        />
        {/* Face layer */}
        <Animated.View style={animatedFaceStyle}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            onPressIn={() => animatePress(true)}
            onPressOut={() => animatePress(false)}
            disabled={isDisabled}
            onPress={handlePress}
            style={{
              minHeight: minH,
              borderRadius: radiusTokens.button,
              borderCurve: "continuous",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              backgroundColor: palette.face,
              ...sizeStyles,
            }}
          >
            {loading ? <ActivityIndicator size="small" color={palette.text} /> : null}
            <Text
              selectable
              style={{

                fontSize: size === "sm" ? 13 : 15,
                fontWeight: "700",
                color: palette.text,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {label}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  // Soft and ghost variants — flat style
  const sizeStyles = getSizeStyles(size);

  if (variant === "ghost") {
    const color = isDisabled ? colorSemanticTokens.text.tertiary : getGhostColor(tone);
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={handlePress}
        style={{
          minHeight: 44,
          borderRadius: radiusTokens.button,
          borderCurve: "continuous",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          ...sizeStyles,
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        {loading ? <ActivityIndicator size="small" color={color} /> : null}
        <Text
          selectable
          style={{
            fontSize: 15,
            fontWeight: "700",
            color,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  // Soft variant
  const softPalette = isDisabled
    ? { backgroundColor: "#F7F7F7", borderColor: "#E5E5E5", color: colorSemanticTokens.text.tertiary }
    : getSoftPalette(tone);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={handlePress}
      style={{
        minHeight: 44,
        borderRadius: radiusTokens.button,
        borderCurve: "continuous",
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        ...sizeStyles,
        backgroundColor: softPalette.backgroundColor,
        borderColor: softPalette.borderColor,
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {loading ? <ActivityIndicator size="small" color={softPalette.color} /> : null}
      <Text
        selectable
        style={{
          fontSize: 15,
          fontWeight: "700",
          color: softPalette.color,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
