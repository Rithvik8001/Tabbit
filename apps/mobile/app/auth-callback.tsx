import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { GradientOrbBackground } from "@/design/primitives/gradient-orb-background";
import { colorTokens } from "@/design/tokens/color";
import { useAuth } from "@/features/auth/state/auth-provider";

export default function AuthCallbackRoute() {
  const { isAuthLoading, session } = useAuth();

  if (isAuthLoading) {
    return (
      <GradientOrbBackground>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colorTokens.brand.primary} />
        </View>
      </GradientOrbBackground>
    );
  }

  return <Redirect href={session ? "/(app)/home-preview" : "/(auth)/login"} />;
}
