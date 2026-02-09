import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/design/primitives/button";
import { useAuth } from "@/features/auth/state/auth-provider";

const FEATURES = [
  {
    emoji: "👥",
    title: "Groups",
    text: "Create groups for any occasion",
    bg: "#E8F5E9",
    accent: "#58CC02",
  },
  {
    emoji: "💰",
    title: "Balances",
    text: "Track who owes what in real time",
    bg: "#E3F2FD",
    accent: "#1CB0F6",
  },
  {
    emoji: "✅",
    title: "Settle up",
    text: "Pay back friends with one tap",
    bg: "#FFF3E0",
    accent: "#FF9800",
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
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 24,
        }}
      >
        {/* Top: Logo + Title + Tagline */}
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("@/assets/images/icon.png")}
            contentFit="cover"
            style={{
              width: 120,
              height: 120,
              borderRadius: 32,
              marginBottom: 20,
            }}
          />

          <Text
            style={{
              fontFamily: "Pacifico_400Regular",
              fontSize: 42,
              color: "#3C3C3C",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Tabbit
          </Text>

          <Text
            style={{
              fontSize: 17,
              fontWeight: "500",
              color: "#6B6B6B",
              textAlign: "center",
              lineHeight: 24,
              maxWidth: 300,
            }}
          >
            Split expenses with friends{"\n"}and settle up effortlessly.
          </Text>
        </View>

        {/* Middle: Feature highlight cards */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            gap: 12,
            paddingVertical: 24,
          }}
        >
          {FEATURES.map((feature) => (
            <View
              key={feature.title}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: feature.bg,
                borderRadius: 16,
                borderCurve: "continuous",
                padding: 16,
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  borderCurve: "continuous",
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 24 }}>{feature.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: feature.accent,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 2,
                  }}
                >
                  {feature.title}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#3C3C3C",
                    lineHeight: 20,
                  }}
                >
                  {feature.text}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom: Buttons */}
        <View style={{ gap: 12 }}>
          <Button
            label="GET STARTED"
            size="lg"
            tone="accent"
            variant="solid"
            onPress={() => {
              router.push("/(auth)/signup");
            }}
          />
          <Button
            label="I ALREADY HAVE AN ACCOUNT"
            size="lg"
            tone="blue"
            variant="solid"
            onPress={() => {
              router.push("/(auth)/login");
            }}
          />
        </View>
      </View>
    </View>
  );
}
