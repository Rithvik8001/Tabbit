import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  useFonts as useGeistFonts,
} from "@expo-google-fonts/geist";
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
  useFonts,
} from "@expo-google-fonts/instrument-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { AppProvider } from "@/providers/app-provider";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { fontFamilyTokens } from "@/design/tokens/typography";
import { useAuth } from "@/features/auth/state/auth-provider";

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isAuthLoading } = useAuth();

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
          fontFamily: fontFamilyTokens.bodySemiBold,
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
  const [geistLoaded, geistError] = useGeistFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const [instrumentLoaded, instrumentError] = useFonts({
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });

  useEffect(() => {
    if (geistLoaded && instrumentLoaded) {
      void SplashScreen.hideAsync();
      return;
    }

    if (geistError || instrumentError) {
      void SplashScreen.hideAsync();
    }
  }, [geistError, geistLoaded, instrumentError, instrumentLoaded]);

  if (!geistLoaded || !instrumentLoaded) {
    if (!geistError && !instrumentError) {
      return null;
    }

    return null;
  }

  return (
    <AppProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProvider>
  );
}
