import * as Haptics from "expo-haptics";
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

type OptionPillProps<T extends string> = {
  value: T;
  label: string;
  selected: boolean;
  onPress: (value: T) => void;
};

const isIOS = process.env.EXPO_OS === "ios";

export function OptionPill<T extends string>({
  value,
  label,
  selected,
  onPress,
}: OptionPillProps<T>) {
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

  const handlePress = () => {
    if (isIOS) {
      void Haptics.selectionAsync();
    }
    onPress(value);
  };

  return (
    <Animated.View style={[{ minWidth: 96 }, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPressIn={() => animatePress(0.985)}
        onPressOut={() => animatePress(1)}
        onPress={handlePress}
        style={{
          borderRadius: radiusTokens.pill,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: selected
            ? "rgba(93, 24, 235, 0.42)"
            : colorTokens.border.subtle,
          backgroundColor: selected
            ? colorTokens.brand.primarySoft
            : "rgba(255, 255, 255, 0.7)",
          paddingHorizontal: spacingTokens.lg,
          paddingVertical: spacingTokens.md,
          alignItems: "center",
          justifyContent: "center",
          boxShadow: selected
            ? "0 12px 20px rgba(93, 24, 235, 0.18)"
            : "0 6px 12px rgba(17, 19, 26, 0.05)",
        }}
      >
        <Text
          style={[
            typographyTokens.label,
            {
              color: selected
                ? colorTokens.brand.primary
                : colorTokens.text.secondary,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
