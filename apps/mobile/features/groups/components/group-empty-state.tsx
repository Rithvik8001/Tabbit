import { Text, View } from "@/design/primitives/sora-native";

import { Button } from "@/design/primitives/button";
import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";

type GroupEmptyStateProps = {
  onCreate: () => void;
};

export function GroupEmptyState({ onCreate }: GroupEmptyStateProps) {
  const colors = useThemeColors();
  const ink = colors.text.primary;
  const muted = colors.text.secondary;
  return (
    <View
      style={{
        borderRadius: radiusTokens.card,
        borderCurve: "continuous",
        backgroundColor: colors.surface.card,
        padding: 24,
        gap: 12,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 62,
          height: 62,
          borderRadius: 999,
          borderCurve: "continuous",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.accent.soft,
        }}
      >
        <Text selectable style={{ fontSize: 30, lineHeight: 34 }}>
          👥
        </Text>
      </View>

      <View style={{ gap: 6, alignItems: "center" }}>
        <Text
          selectable
          style={{
            color: ink,
            fontSize: 22,
            lineHeight: 26,
            fontWeight: "600",
          }}
        >
          No groups yet
        </Text>
        <Text
          selectable
          style={{
            color: muted,
            fontSize: 15,
            lineHeight: 20,
            fontWeight: "400",
            textAlign: "center",
          }}
        >
          Create your first group to start organizing shared expenses in one
          place.
        </Text>
      </View>

      <View style={{ marginTop: 6 }}>
        <Button
          label="Create your first group"
          onPress={onCreate}
          size="md"
        />
      </View>
    </View>
  );
}
