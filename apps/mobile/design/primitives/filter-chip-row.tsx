import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, Text } from "@/design/primitives/sora-native";

import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { fontFamilyTokens, typographyScale } from "@/design/tokens/typography";

export type FilterChip<T extends string> = { key: T; label: string };

type FilterChipRowProps<T extends string> = {
  chips: readonly FilterChip<T>[];
  activeKey: T;
  onSelect: (key: T) => void;
};

export function FilterChipRow<T extends string>({
  chips,
  activeKey,
  onSelect,
}: FilterChipRowProps<T>) {
  const colors = useThemeColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacingTokens.sm }}
    >
      {chips.map((chip) => {
        const isActive = chip.key === activeKey;
        return (
          <Pressable
            key={chip.key}
            accessibilityRole="button"
            onPress={() => {
              void Haptics.selectionAsync();
              onSelect(chip.key);
            }}
            style={{
              borderRadius: radiusTokens.pill,
              borderCurve: "continuous",
              paddingHorizontal: spacingTokens.md,
              paddingVertical: spacingTokens.sm,
              backgroundColor: isActive
                ? colors.accent.primary
                : colors.surface.card,
              borderWidth: isActive ? 0 : 1,
              borderColor: isActive
                ? undefined
                : colors.border.subtle,
            }}
          >
            <Text
              style={[
                typographyScale.labelMd,
                {
                  color: isActive
                    ? colors.text.inverse
                    : colors.text.secondary,
                  fontFamily: isActive
                    ? fontFamilyTokens.bodySemiBold
                    : fontFamilyTokens.bodyMedium,
                },
              ]}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
