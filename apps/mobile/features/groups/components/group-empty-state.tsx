import { Pressable, Text, View } from "react-native";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";

type GroupEmptyStateProps = {
  onCreate: () => void;
};

export function GroupEmptyState({ onCreate }: GroupEmptyStateProps) {
  return (
    <View
      style={{
        borderRadius: 20,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: stroke,
        backgroundColor: surface,
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
          backgroundColor: "#ECE9FF",
        }}
      >
        <Text selectable style={{ fontSize: 30, lineHeight: 34 }}>
          👥
        </Text>
      </View>

      <View style={{ gap: 6, alignItems: "center" }}>
        <Text
          selectable
          style={{ color: ink, fontSize: 22, lineHeight: 26, fontWeight: "700" }}
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
          Create your first group to start organizing shared expenses in one place.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onCreate}
        style={{
          marginTop: 6,
          borderRadius: 999,
          borderCurve: "continuous",
          backgroundColor: accent,
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <Text
          selectable
          style={{
            color: "#FFFFFF",
            fontSize: 14,
            lineHeight: 18,
            fontWeight: "700",
          }}
        >
          Create your first group
        </Text>
      </Pressable>
    </View>
  );
}
