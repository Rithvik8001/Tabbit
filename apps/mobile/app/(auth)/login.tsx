import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "@/design/primitives/sora-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/design/primitives/button";
import { HeaderPillButton } from "@/design/primitives/page-heading";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { useAuth } from "@/features/auth/state/auth-provider";
import { loginSchema, parseFormErrors } from "@/features/auth/utils/auth-schemas";

function getParamValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ verified?: string }>();
  const verifiedParam = getParamValue(params.verified);
  const { session, isAuthLoading, signInWithPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.replace("/(app)/(tabs)/(home)");
    }
  }, [isAuthLoading, router, session]);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setServerError(null);
  }, []);

  const handleLogin = () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldErrors(parseFormErrors(result));
      return;
    }

    setFieldErrors({});
    setServerError(null);
    setIsSubmitting(true);

    void (async () => {
      const authResult = await signInWithPassword(email.trim(), password);
      setIsSubmitting(false);

      if (!authResult.ok) {
        setServerError(authResult.message ?? "Unable to log in.");
        return;
      }

      router.replace("/(app)/(tabs)/(home)");
    })();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colorSemanticTokens.background.canvas }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: 24,
            gap: 18,
          }}
        >
          <HeaderPillButton
            label="Back"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }

              router.replace("/(onboarding)");
            }}
          />

          <View
            style={{
              borderRadius: 28,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colorSemanticTokens.border.subtle,
              backgroundColor: colorSemanticTokens.surface.card,
              paddingHorizontal: 18,
              paddingVertical: 18,
              gap: 12,
              alignItems: "center",
            }}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              contentFit="cover"
              style={{
                width: 98,
                height: 98,
                borderRadius: 24,
              }}
            />
            <Text
              selectable
              style={{
                color: colorSemanticTokens.text.primary,
                fontSize: 32,
                lineHeight: 40,
                fontWeight: "800",
                letterSpacing: -0.5,
              }}
            >
              Welcome back
            </Text>
            <Text
              selectable
              style={{
                color: colorSemanticTokens.text.secondary,
                fontSize: 16,
                lineHeight: 24,
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              Sign in to continue splitting and settling.
            </Text>
          </View>

          <View
            style={{
              borderRadius: 28,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colorSemanticTokens.border.subtle,
              backgroundColor: colorSemanticTokens.surface.card,
              paddingHorizontal: 16,
              paddingVertical: 16,
              gap: 12,
            }}
          >
            <Text
              selectable
              style={{
                color: colorSemanticTokens.text.primary,
                fontSize: 20,
                lineHeight: 26,
                fontWeight: "700",
              }}
            >
              Sign in with Email
            </Text>

            <View style={{ gap: 8 }}>
              <Text
                selectable
                style={{
                  color: colorSemanticTokens.text.secondary,
                  fontSize: 15,
                  lineHeight: 20,
                  fontWeight: "600",
                }}
              >
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearFieldError("email");
                }}
                placeholder="Your email"
                placeholderTextColor={colorSemanticTokens.text.tertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                selectionColor={colorSemanticTokens.accent.primary}
                style={{
                  borderRadius: radiusTokens.xl,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: fieldErrors.email
                    ? colorSemanticTokens.state.danger
                    : colorSemanticTokens.border.subtle,
                  backgroundColor: colorSemanticTokens.background.subtle,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  color: colorSemanticTokens.text.primary,
                  fontSize: 16,
                  lineHeight: 22,
                  fontWeight: "500",
                }}
              />
              {fieldErrors.email ? (
                <Text
                  selectable
                  style={{
                    color: colorSemanticTokens.state.danger,
                    fontSize: 12,
                    lineHeight: 17,
                    fontWeight: "500",
                  }}
                >
                  {fieldErrors.email}
                </Text>
              ) : null}
            </View>

            <View style={{ gap: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  selectable
                  style={{
                    color: colorSemanticTokens.text.secondary,
                    fontSize: 15,
                    lineHeight: 20,
                    fontWeight: "600",
                  }}
                >
                  Password
                </Text>

                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable>
                    <Text
                      selectable
                      style={{
                        color: colorSemanticTokens.accent.primary,
                        fontSize: 15,
                        lineHeight: 20,
                        fontWeight: "700",
                      }}
                    >
                      Forgot?
                    </Text>
                  </Pressable>
                </Link>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: radiusTokens.xl,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: fieldErrors.password
                    ? colorSemanticTokens.state.danger
                    : colorSemanticTokens.border.subtle,
                  backgroundColor: colorSemanticTokens.background.subtle,
                  paddingHorizontal: 20,
                }}
              >
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearFieldError("password");
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={colorSemanticTokens.text.tertiary}
                  secureTextEntry={isPasswordHidden}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  autoComplete="password"
                  selectionColor={colorSemanticTokens.accent.primary}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    color: colorSemanticTokens.text.primary,
                    fontSize: 16,
                    lineHeight: 22,
                    fontWeight: "500",
                  }}
                />
                <Pressable onPress={() => setIsPasswordHidden((prev) => !prev)}>
                  <Ionicons
                    name={isPasswordHidden ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={colorSemanticTokens.text.tertiary}
                  />
                </Pressable>
              </View>
              {fieldErrors.password ? (
                <Text
                  selectable
                  style={{
                    color: colorSemanticTokens.state.danger,
                    fontSize: 12,
                    lineHeight: 17,
                    fontWeight: "500",
                  }}
                >
                  {fieldErrors.password}
                </Text>
              ) : null}
            </View>

            {serverError ? (
              <Text
                selectable
                style={{
                  color: colorSemanticTokens.state.danger,
                  fontSize: 12,
                  lineHeight: 17,
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                {serverError}
              </Text>
            ) : null}

            {!serverError && verifiedParam === "1" ? (
              <Text
                selectable
                style={{
                  color: colorSemanticTokens.state.success,
                  fontSize: 12,
                  lineHeight: 17,
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                Email verified. Log in to continue.
              </Text>
            ) : null}

            <Button
              label="Log in"
              onPress={handleLogin}
              loading={isSubmitting}
              disabled={isSubmitting}
              size="lg"
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingBottom: 4,
            }}
          >
            <Text
              selectable
              style={{
                color: colorSemanticTokens.text.tertiary,
                fontSize: 14,
                lineHeight: 20,
                fontWeight: "500",
              }}
            >
              New to Tabbit?
            </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text
                  selectable
                  style={{
                    color: colorSemanticTokens.accent.primary,
                    fontSize: 14,
                    lineHeight: 20,
                    fontWeight: "700",
                  }}
                >
                  Create account
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
