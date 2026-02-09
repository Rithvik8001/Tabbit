import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/design/primitives/button";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { useAuth } from "@/features/auth/state/auth-provider";

const HIGHLIGHTS = [
  {
    emoji: "⚡",
    title: "Instant splits",
    text: "Add an expense and split in seconds.",
  },
  {
    emoji: "🤝",
    title: "Clear balances",
    text: "Know exactly who owes what at any moment.",
  },
  {
    emoji: "✅",
    title: "One-tap settle",
    text: "Record payments and close the loop fast.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthLoading, session } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.replace("/(app)/(tabs)/(home)");
    }
  }, [isAuthLoading, router, session]);

  return (
    <View style={{ flex: 1, backgroundColor: colorSemanticTokens.background.canvas }}>
      <View
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: radiusTokens.pill,
          backgroundColor: colorSemanticTokens.accent.soft,
          top: -70,
          right: -80,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: radiusTokens.pill,
          backgroundColor: colorSemanticTokens.state.infoSoft,
          bottom: 120,
          left: -90,
        }}
      />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 24,
          gap: 22,
        }}
      >
        <View
          style={{
            borderRadius: 30,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colorSemanticTokens.border.subtle,
            backgroundColor: colorSemanticTokens.surface.card,
            paddingHorizontal: 20,
            paddingVertical: 18,
            gap: 18,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Image
              source={require("@/assets/images/icon.png")}
              contentFit="cover"
              style={{
                width: 126,
                height: 126,
                borderRadius: 30,
              }}
            />
          </View>
          <View style={{ gap: 8 }}>
            <Text
              selectable
              style={{
                color: colorSemanticTokens.text.primary,
                fontSize: 34,
                lineHeight: 42,
                fontWeight: "800",
                letterSpacing: -0.7,
              }}
            >
              Split smarter.
            </Text>
            <Text
              selectable
              style={{
                color: colorSemanticTokens.text.primary,
                fontSize: 34,
                lineHeight: 42,
                fontWeight: "800",
                letterSpacing: -0.7,
              }}
            >
              Settle faster.
            </Text>
            <Text
              selectable
              style={{
                color: colorSemanticTokens.text.secondary,
                fontSize: 16,
                lineHeight: 24,
                fontWeight: "500",
                marginTop: 4,
              }}
            >
              Tabbit keeps every shared expense clean, quick, and stress-free.
            </Text>
          </View>
        </View>

        <View style={{ gap: 10 }}>
          {HIGHLIGHTS.map((item) => (
            <View
              key={item.title}
              style={{
                borderRadius: 20,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: colorSemanticTokens.border.subtle,
                backgroundColor: colorSemanticTokens.surface.card,
                paddingHorizontal: 16,
                paddingVertical: 13,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radiusTokens.pill,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colorSemanticTokens.background.subtle,
                }}
              >
                <Text selectable style={{ fontSize: 20 }}>
                  {item.emoji}
                </Text>
              </View>

              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  selectable
                  style={{
                    color: colorSemanticTokens.text.primary,
                    fontSize: 15,
                    lineHeight: 20,
                    fontWeight: "700",
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  selectable
                  style={{
                    color: colorSemanticTokens.text.secondary,
                    fontSize: 14,
                    lineHeight: 20,
                    fontWeight: "500",
                  }}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: "auto", gap: 14 }}>
          <Button
            label="Create account"
            size="lg"
            tone="accent"
            variant="solid"
            onPress={() => {
              router.push("/(auth)/signup");
            }}
          />

          <Pressable
            onPress={() => {
              router.push("/(auth)/login");
            }}
            style={{ paddingVertical: 8 }}
          >
            <Text
              selectable
              style={{
                color: colorSemanticTokens.text.primary,
                fontSize: 18,
                lineHeight: 26,
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              Already have an account?{" "}
              <Text
                selectable
                style={{
                  color: colorSemanticTokens.accent.primary,
                  fontWeight: "700",
                }}
              >
                Sign in
              </Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
