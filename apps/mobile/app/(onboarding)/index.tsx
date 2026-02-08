import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/design/primitives/button";
import { useAuth } from "@/features/auth/state/auth-provider";

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
          alignItems: "center",
          justifyContent: "center",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingHorizontal: 24,
        }}
      >
        {/* Icon */}
        <View
          style={{
            borderRadius: 24,
            borderCurve: "continuous",
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Image
            source={require("@/assets/images/icon.png")}
            contentFit="cover"
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
            }}
          />
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#3C3C3C",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Tabbit
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: 15,
            fontWeight: "400",
            color: "#AFAFAF",
            textAlign: "center",
            lineHeight: 22,
            maxWidth: 280,
            marginBottom: 48,
          }}
        >
          Split expenses with friends and settle up effortlessly.
        </Text>

        {/* Buttons */}
        <View style={{ width: "100%", gap: 12 }}>
          <Button
            label="GET STARTED"
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
            style={{
              backgroundColor: "#1CB0F6",
              borderRadius: 16,
              borderCurve: "continuous",
              minHeight: 50,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#FFFFFF",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              I ALREADY HAVE AN ACCOUNT
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
