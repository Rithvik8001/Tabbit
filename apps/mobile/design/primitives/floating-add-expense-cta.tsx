import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "@/design/primitives/sora-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";
import { typographyScale } from "@/design/tokens/typography";

type FloatingAddExpenseCtaProps = {
  onPress: () => void;
  label?: string;
};

export function FloatingAddExpenseCta({
  onPress,
  label = "Add expense",
}: FloatingAddExpenseCtaProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        right: 20,
        bottom: insets.bottom + 64,
      }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={{
          minHeight: 56,
          paddingHorizontal: 20,
          borderRadius: radiusTokens.pill,
          borderCurve: "continuous",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: colors.accent.primary,
          boxShadow: `0 10px 22px ${colors.accent.softStrong}`,
        }}
      >
        <Ionicons
          name="receipt-outline"
          size={20}
          color={colors.text.inverse}
        />
        <Text
          selectable
          style={[
            typographyScale.headingMd,
            { color: colors.text.inverse },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}
