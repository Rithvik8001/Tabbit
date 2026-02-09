import {
  useFonts,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from "@expo-google-fonts/sora";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "@/design/primitives/sora-native";

import { AppProvider } from "@/providers/app-provider";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { useAuth } from "@/features/auth/state/auth-provider";

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isAuthLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  useEffect(() => {
    if (!isAuthLoading && fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [isAuthLoading, fontsLoaded]);

  if (isAuthLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colorSemanticTokens.accent.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: colorSemanticTokens.background.canvas,
        },
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
