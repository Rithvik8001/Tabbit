import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/design/primitives/button";
import { LiquidSurface } from "@/design/primitives/liquid-surface";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useAuth } from "@/features/auth/state/auth-provider";

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { isAuthLoading, session } = useAuth();

  const isCompact = height < 760;

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.replace("/(app)/(tabs)/(home)");
    }
  }, [isAuthLoading, router, session]);

  return (
    <View style={{ flex: 1, backgroundColor: colorSemanticTokens.background.canvas }}>
      <LinearGradient
        colors={[
          colorSemanticTokens.background.gradientStart,
          colorSemanticTokens.background.gradientEnd,
        ]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />
      <LinearGradient
        colors={["rgba(50, 87, 226, 0.18)", "rgba(50, 87, 226, 0.00)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          top: -48,
          left: -24,
          right: -24,
          height: 260,
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingTop: Math.max(insets.top + (isCompact ? 16 : 26), 40),
          paddingBottom: Math.max(insets.bottom + 20, 26),
          paddingHorizontal: spacingTokens.screenHorizontal,
        }}
      >
        <View style={{ gap: isCompact ? spacingTokens.lg : spacingTokens.xl }}>
          <LiquidSurface
            kind="strong"
            contentStyle={{
              alignSelf: "flex-start",
              borderRadius: 32,
              borderCurve: "continuous",
              padding: 10,
            }}
          >
            <View
              style={{
                width: 62,
                height: 62,
                borderRadius: 22,
                borderCurve: "continuous",
                backgroundColor: "rgba(255, 255, 255, 0.82)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("@/assets/images/icon.png")}
                contentFit="cover"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                }}
              />
            </View>
          </LiquidSurface>

          <View style={{ gap: spacingTokens.sm }}>
            <Text
              selectable
              style={[
                typographyScale.displayXl,
                {
                  color: colorSemanticTokens.text.primary,
                  fontSize: isCompact ? 36 : typographyScale.displayXl.fontSize,
                  lineHeight: isCompact ? 42 : typographyScale.displayXl.lineHeight,
                },
              ]}
            >
              Welcome to Tabbit
            </Text>
            <Text
              selectable
              style={[
                typographyScale.bodyLg,
                {
                  color: colorSemanticTokens.text.secondary,
                  maxWidth: 340,
                },
              ]}
            >
              Split expenses with friends, track balances instantly, and settle up with clarity.
            </Text>
          </View>
        </View>

        <LiquidSurface
          kind="strong"
          contentStyle={{
            padding: spacingTokens.cardPadding,
            gap: spacingTokens.sm,
          }}
        >
          <Button
            label="Create Account"
            size="lg"
            onPress={() => {
              router.push("/(auth)/signup");
            }}
          />
          <Button
            label="Log In"
            variant="soft"
            size="lg"
            onPress={() => {
              router.push("/(auth)/login");
            }}
          />
        </LiquidSurface>
      </View>
    </View>
  );
}
