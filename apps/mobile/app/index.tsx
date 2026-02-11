import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "@/design/primitives/sora-native";

import { useThemeColors } from "@/providers/theme-provider";
import { useAuth } from "@/features/auth/state/auth-provider";

export default function Index() {
  const colors = useThemeColors();
  const { session, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.accent.primary} />
      </View>
    );
  }

  return <Redirect href={session ? "/(app)/(tabs)/(friends)" : "/(onboarding)"} />;
}
