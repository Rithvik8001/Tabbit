import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthInputGroup } from "@/features/auth/components/auth-input-group";
import { AuthScreenShell } from "@/features/auth/components/auth-screen-shell";
import { useAuth } from "@/features/auth/state/auth-provider";
import { isValidEmail } from "@/features/auth/utils/auth-validation";

export default function LoginScreen() {
  const router = useRouter();
  const { session, isAuthLoading, signInWithPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.replace("/(app)/(tabs)/(home)");
    }
  }, [isAuthLoading, router, session]);

  const handleLogin = () => {
    if (!isValidEmail(email)) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (password.length === 0) {
      setFormError("Enter your password.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    void (async () => {
      const result = await signInWithPassword(email.trim(), password);
      setIsSubmitting(false);

      if (!result.ok) {
        setFormError(result.message ?? "Unable to log in.");
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
            onChangeText: setEmail,
            autoCapitalize: "none",
            autoCorrect: false,
            keyboardType: "email-address",
            textContentType: "emailAddress",
            autoComplete: "email",
          },
          {
            placeholder: "Password",
            value: password,
            onChangeText: setPassword,
            secureTextEntry: true,
            autoCapitalize: "none",
            autoCorrect: false,
            textContentType: "password",
            autoComplete: "password",
          },
        ]}
      />

      {formError ? (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "400",
            color: "#FF4B4B",
            textAlign: "center",
          }}
        >
          {formError}
        </Text>
      ) : null}

      {/* Log In button */}
      <Pressable
        disabled={isSubmitting}
        onPress={handleLogin}
        style={{
          backgroundColor: "#E5E5E5",
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
            color: "#AFAFAF",
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
