import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "@/design/primitives/sora-native";

import { AppProvider } from "@/providers/app-provider";
import { useTheme } from "@/providers/theme-provider";
import { useAuth } from "@/features/auth/state/auth-provider";

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isAuthLoading } = useAuth();
  const { colors, isHydrated } = useTheme();

  useEffect(() => {
    if (!isAuthLoading && isHydrated) {
      void SplashScreen.hideAsync();
    }
  }, [isAuthLoading, isHydrated]);

  if (isAuthLoading || !isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.accent.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: colors.background.canvas,
        },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontSize: 17,
          color: colors.text.primary,
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
      <AppChrome />
    </AppProvider>
  );
}

function AppChrome() {
  const { resolvedTheme } = useTheme();
  return (
    <>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <RootNavigator />
    </>
  );
}
