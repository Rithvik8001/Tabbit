import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { colorTokens } from "@/design/tokens/color";
import { useAuth } from "@/features/auth/state/auth-provider";

export default function Index() {
  const { session, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colorTokens.brand.primary} />
      </View>
    );
  }

  return <Redirect href={session ? "/(app)/home-preview" : "/(onboarding)"} />;
}
