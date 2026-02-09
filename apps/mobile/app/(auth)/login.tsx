import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthInputGroup } from "@/features/auth/components/auth-input-group";
import { AuthScreenShell } from "@/features/auth/components/auth-screen-shell";
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
  const params = useLocalSearchParams<{ verified?: string }>();
  const verifiedParam = getParamValue(params.verified);
  const { session, isAuthLoading, signInWithPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

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
    <AuthScreenShell title="Enter your details">
      <AuthInputGroup
        fields={[
          {
            placeholder: "Email",
            value: email,
            onChangeText: (text: string) => {
              setEmail(text);
              clearFieldError("email");
            },
            autoCapitalize: "none",
            autoCorrect: false,
            keyboardType: "email-address",
            textContentType: "emailAddress",
            autoComplete: "email",
            error: fieldErrors.email,
          },
          {
            placeholder: "Password",
            value: password,
            onChangeText: (text: string) => {
              setPassword(text);
              clearFieldError("password");
            },
            secureTextEntry: true,
            autoCapitalize: "none",
            autoCorrect: false,
            textContentType: "password",
            autoComplete: "password",
            error: fieldErrors.password,
          },
        ]}
      />

      {serverError ? (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "400",
            color: "#FF4B4B",
            textAlign: "center",
          }}
        >
          {serverError}
        </Text>
      ) : null}

      {!serverError && verifiedParam === "1" ? (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "400",
            color: "#58CC02",
            textAlign: "center",
          }}
        >
          Email verified. Log in to continue.
        </Text>
      ) : null}

      {/* Log In button */}
      <Pressable
        disabled={isSubmitting}
        onPress={handleLogin}
        style={{
          backgroundColor: "#1CB0F6",
          borderRadius: 16,
          borderCurve: "continuous",
          minHeight: 50,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 14,
          opacity: isSubmitting ? 0.5 : 1,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          LOG IN
        </Text>
      </Pressable>

      {/* Forgot password */}
      <Link href="/(auth)/forgot-password" asChild>
        <Pressable style={{ alignSelf: "center" }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#1CB0F6",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            FORGOT PASSWORD
          </Text>
        </Pressable>
      </Link>

      {/* Bottom row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          paddingTop: 8,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "400",
            color: "#AFAFAF",
          }}
        >
          New to Tabbit?
        </Text>
        <Link href="/(auth)/signup" asChild>
          <Pressable>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#1CB0F6",
                textTransform: "uppercase",
                letterSpacing: 0.2,
              }}
            >
              CREATE ACCOUNT
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
