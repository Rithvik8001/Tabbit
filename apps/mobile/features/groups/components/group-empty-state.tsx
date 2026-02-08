import { Text, View } from "react-native";

import { Button } from "@/design/primitives/button";
import { colorSemanticTokens } from "@/design/tokens/colors";

const ink = colorSemanticTokens.text.primary;
const muted = colorSemanticTokens.text.secondary;

type GroupEmptyStateProps = {
  onCreate: () => void;
};

export function GroupEmptyState({ onCreate }: GroupEmptyStateProps) {
  return (
    <View
      style={{
        borderRadius: 16,
        borderCurve: "continuous",
        borderWidth: 2,
        borderColor: "#E5E5E5",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        padding: 20,
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
          backgroundColor: colorSemanticTokens.accent.soft,
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
            fontWeight: "700",
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
            fontWeight: "500",
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
