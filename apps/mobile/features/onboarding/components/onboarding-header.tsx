import { Pressable, Text, View } from "react-native";

import { ProgressDots } from "@/design/primitives/progress-dots";
import { colorTokens } from "@/design/tokens/color";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyTokens } from "@/design/tokens/typography";

type OnboardingHeaderProps = {
  step: number;
  total: number;
  onBack?: () => void;
  onSkip?: () => void;
};

export function OnboardingHeader({
  step,
  total,
  onBack,
  onSkip,
}: OnboardingHeaderProps) {
  return (
    <View style={{ gap: spacingTokens.md }}>
      <View
        style={{
          minHeight: 34,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            hitSlop={12}
            style={{ minWidth: 56 }}
          >
            <Text style={[typographyTokens.label, { color: colorTokens.text.secondary }]}>
              Back
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 56 }} />
        )}
        {onSkip ? (
          <Pressable
            accessibilityRole="button"
            onPress={onSkip}
            hitSlop={12}
            style={{ minWidth: 56, alignItems: "flex-end" }}
          >
            <Text style={[typographyTokens.label, { color: colorTokens.text.secondary }]}>
              Skip
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 56 }} />
        )}
      </View>
      <ProgressDots currentIndex={step - 1} total={total} />
    </View>
  );
}
