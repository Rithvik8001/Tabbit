import { Stack, useRouter } from "expo-router";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/features/auth/state/auth-provider";
import { useOnboardingStore } from "@/features/onboarding/state/onboarding.store";

const primaryPurple = "#4A29FF";

export default function HomePreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { signOut } = useAuth();
  const { draft, resetDraft } = useOnboardingStore();

  const isCompact = height < 780;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Stack.Screen options={{ title: "Preview Home" }} />

      <View
        style={{
          flex: 1,
          paddingTop: Math.max(insets.top, 12),
          paddingHorizontal: 24,
          paddingBottom: Math.max(insets.bottom, 16),
          gap: isCompact ? 14 : 18,
        }}
      >
        <View style={{ marginTop: 10, gap: 12 }}>
          <Text
            selectable
            style={{
              color: "#77829A",
              fontSize: 16,
              lineHeight: 20,
              letterSpacing: 1,
              fontWeight: "700",
            }}
          >
            TABBIT / PREVIEW
          </Text>
          <View
            style={{
              width: 68,
              height: 2,
              borderRadius: 99,
              backgroundColor: "#E7EAF0",
            }}
          />
          <Text
            selectable
            style={{
              color: "#0E1116",
              fontSize: isCompact ? 44 : 52,
              lineHeight: isCompact ? 48 : 56,
              letterSpacing: -0.6,
              fontWeight: "600",
            }}
          >
            Shared balances, beautifully clear.
          </Text>
        </View>

        <View
          style={{
            borderRadius: 22,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: "#E8EBF1",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 8px 20px rgba(17, 20, 26, 0.05)",
            padding: isCompact ? 16 : 18,
            gap: 12,
          }}
        >
          <Text
            selectable
            style={{
              color: "#68748E",
              fontSize: 16,
              lineHeight: 18,
              letterSpacing: 1.1,
              fontWeight: "700",
            }}
          >
            TOTAL OWED TO YOU
          </Text>
          <Text
            selectable
            style={{
              color: "#0E1116",
              fontSize: isCompact ? 50 : 58,
              lineHeight: isCompact ? 54 : 62,
              letterSpacing: -0.8,
              fontWeight: "700",
              fontVariant: ["tabular-nums"],
            }}
          >
            $248.40
          </Text>
          <Text
            selectable
            style={{
              color: "#596170",
              fontSize: 18,
              lineHeight: 28,
              letterSpacing: -0.08,
              fontWeight: "500",
            }}
          >
            Style: {draft.splitStyle ?? "not set"} • Context: {draft.useContext ?? "not set"}
          </Text>
        </View>

        <View
          style={{
            borderRadius: 22,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: "#E8EBF1",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 8px 20px rgba(17, 20, 26, 0.05)",
            padding: isCompact ? 16 : 18,
            gap: 14,
          }}
        >
          <Text
            selectable
            style={{
              color: "#0E1116",
              fontSize: 28,
              lineHeight: 30,
              letterSpacing: -0.3,
              fontWeight: "600",
            }}
          >
            At a glance
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View
              style={{
                flex: 1,
                borderRadius: 16,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: "#DCE2EC",
                padding: 14,
                gap: 8,
                backgroundColor: "#FFFFFF",
              }}
            >
              <Text
                selectable
                style={{
                  color: "#7A849A",
                  fontSize: 15,
                  lineHeight: 18,
                  fontWeight: "500",
                }}
              >
                People involved
              </Text>
              <Text
                selectable
                style={{
                  color: "#0E1116",
                  fontSize: 40 / 2,
                  lineHeight: 40 / 2,
                  fontWeight: "700",
                }}
              >
                4
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                borderRadius: 16,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: "#DCE2EC",
                padding: 14,
                gap: 8,
                backgroundColor: "#FFFFFF",
              }}
            >
              <Text
                selectable
                style={{
                  color: "#7A849A",
                  fontSize: 15,
                  lineHeight: 18,
                  fontWeight: "500",
                }}
              >
                Pending requests
              </Text>
              <Text
                selectable
                style={{
                  color: "#0E1116",
                  fontSize: 40 / 2,
                  lineHeight: 40 / 2,
                  fontWeight: "700",
                }}
              >
                2
              </Text>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            {["Coffee run split equally", "Groceries split by exact amounts"].map((row) => {
              return (
                <Text
                  key={row}
                  selectable
                  style={{
                    color: "#596170",
                    fontSize: 18,
                    lineHeight: 28,
                    letterSpacing: -0.08,
                    fontWeight: "500",
                  }}
                >
                  {row}
                </Text>
              );
            })}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ borderTopWidth: 1, borderTopColor: "#E8EBF1", paddingTop: 12 }}>
          <Pressable
            onPress={() => {
              void (async () => {
                const result = await signOut();
                if (!result.ok) {
                  return;
                }
                resetDraft();
                router.replace("/(onboarding)");
              })();
            }}
            style={{
              borderRadius: 26,
              borderCurve: "continuous",
              backgroundColor: primaryPurple,
              height: 66,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              selectable
              style={{
                color: "#FFFFFF",
                fontSize: 22,
                lineHeight: 22,
                fontWeight: "700",
              }}
            >
              Sign Out & Restart Onboarding
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
