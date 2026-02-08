import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/design/primitives/button";
import { useAuth } from "@/features/auth/state/auth-provider";

const FEATURES = [
  { emoji: "👥", text: "Create groups for any occasion" },
  { emoji: "💰", text: "Track balances in real time" },
  { emoji: "✅", text: "Settle up with one tap" },
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

        {/* Middle: Feature highlights — clean, no cards */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
          }}
        >
          {FEATURES.map((feature) => (
            <View
              key={feature.text}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 28 }}>{feature.emoji}</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#3C3C3C",
                }}
              >
                {feature.text}
              </Text>
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
