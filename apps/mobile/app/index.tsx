import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "@/design/primitives/sora-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { useAuth } from "@/features/auth/state/auth-provider";

export default function Index() {
  const { session, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colorSemanticTokens.accent.primary} />
      </View>
    );
  }

  return <Redirect href={session ? "/(app)/(tabs)/(friends)" : "/(onboarding)"} />;
}
