import { useRouter } from "expo-router";
import { Pressable, Text, View } from "@/design/primitives/sora-native";

import { ScreenContainer } from "@/design/primitives/screen-container";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import {
  type ThemePreference,
  useTheme,
  useThemeColors,
} from "@/providers/theme-provider";

const APPEARANCE_OPTIONS: { key: ThemePreference; label: string; description: string }[] = [
  {
    key: "system",
    label: "System",
    description: "Follow your device appearance.",
  },
  {
    key: "light",
    label: "Light",
    description: "Always use light mode.",
  },
  {
    key: "dark",
    label: "Dark",
    description: "Always use dark mode.",
  },
];

export default function AppearanceSettingsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { preference, resolvedTheme, setPreference } = useTheme();

  return (
    <ScreenContainer contentContainerStyle={{ gap: spacingTokens.md }}>
      <View
        style={{
          minHeight: 40,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Text
            selectable
            style={[
              typographyScale.headingSm,
              { color: colors.text.secondary },
            ]}
          >
            Back
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text
            selectable
            style={[
              typographyScale.headingSm,
              { color: colors.accent.primary },
            ]}
          >
            Done
          </Text>
        </Pressable>
      </View>

      <Text
        selectable
        style={[typographyScale.displayMd, { color: colors.text.primary }]}
      >
        Appearance
      </Text>

      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.border.subtle,
          backgroundColor: colors.surface.card,
          overflow: "hidden",
        }}
      >
        {APPEARANCE_OPTIONS.map((option, index) => {
          const isSelected = preference === option.key;

          return (
            <Pressable
              key={option.key}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setPreference(option.key)}
              style={{
                paddingHorizontal: spacingTokens.md,
                paddingVertical: spacingTokens.md,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: colors.border.subtle,
                backgroundColor: isSelected
                  ? colors.accent.soft
                  : colors.surface.card,
                gap: spacingTokens.xs,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: spacingTokens.sm,
                }}
              >
                <Text
                  selectable
                  style={[
                    typographyScale.headingMd,
                    {
                      color: isSelected
                        ? colors.accent.primary
                        : colors.text.primary,
                    },
                  ]}
                >
                  {option.label}
                </Text>

                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: radiusTokens.pill,
                    borderWidth: 2,
                    borderColor: isSelected
                      ? colors.accent.primary
                      : colors.border.muted,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSelected ? (
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: radiusTokens.pill,
                        backgroundColor: colors.accent.primary,
                      }}
                    />
                  ) : null}
                </View>
              </View>

              <Text
                selectable
                style={[
                  typographyScale.bodySm,
                  { color: colors.text.secondary },
                ]}
              >
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.border.subtle,
          backgroundColor: colors.surface.card,
          padding: spacingTokens.cardPadding,
          gap: spacingTokens.xs,
        }}
      >
        <Text
          selectable
          style={[typographyScale.headingSm, { color: colors.text.primary }]}
        >
          System mode status
        </Text>
        <Text
          selectable
          style={[typographyScale.bodySm, { color: colors.text.secondary }]}
        >
          {`Currently ${resolvedTheme === "dark" ? "Dark" : "Light"}`}
        </Text>
      </View>
    </ScreenContainer>
  );
}
