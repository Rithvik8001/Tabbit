import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { AppProvider } from "@/providers/app-provider";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { useAuth } from "@/features/auth/state/auth-provider";

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading) {
      void SplashScreen.hideAsync();
    }
  }, [isAuthLoading]);

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colorSemanticTokens.accent.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colorSemanticTokens.background.canvas },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colorSemanticTokens.text.primary,
        headerTitleStyle: {
          fontSize: 17,
          color: colorSemanticTokens.text.primary,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProvider>
  );
}
