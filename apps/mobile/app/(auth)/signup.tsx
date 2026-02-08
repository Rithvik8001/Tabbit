import { Link, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthInputGroup } from "@/features/auth/components/auth-input-group";
import { AuthScreenShell } from "@/features/auth/components/auth-screen-shell";
import { useAuth } from "@/features/auth/state/auth-provider";
import { signupSchema, parseFormErrors } from "@/features/auth/utils/auth-schemas";

export default function SignupScreen() {
  const router = useRouter();
  const { session, isAuthLoading, signUpWithPassword } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null,
  );

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

  const handleSignUp = () => {
    if (verificationMessage) {
      router.replace("/(auth)/login");
      return;
    }

    const result = signupSchema.safeParse({
      displayName,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      setFieldErrors(parseFormErrors(result));
      return;
    }

    setFieldErrors({});
    setServerError(null);
    setIsSubmitting(true);

    void (async () => {
      const authResult = await signUpWithPassword(
        result.data.displayName,
        result.data.email,
        password,
      );
      setIsSubmitting(false);

      if (!authResult.ok) {
        setServerError(authResult.message ?? "Unable to create account.");
        return;
      }

      if (authResult.requiresEmailVerification) {
        setVerificationMessage(
          authResult.message ??
            "Check your inbox and confirm your email to continue.",
        );
        return;
      }

      router.replace("/(app)/(tabs)/(home)");
    })();
  };

  if (verificationMessage) {
    return (
      <AuthScreenShell title="Check your email">
        <Text
          style={{
            fontSize: 15,
            fontWeight: "400",
            color: "#3C3C3C",
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          {verificationMessage}
        </Text>

        <Pressable
          onPress={() => router.replace("/(auth)/login")}
          style={{
            backgroundColor: "#1CB0F6",
            borderRadius: 16,
            borderCurve: "continuous",
            minHeight: 50,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 14,
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
            GO TO LOGIN
          </Text>
        </Pressable>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell title="Create your account">
      <AuthInputGroup
        fields={[
          {
            placeholder: "Username",
            value: displayName,
            onChangeText: (text: string) => {
              setDisplayName(text);
              clearFieldError("displayName");
            },
            autoCapitalize: "words",
            autoCorrect: false,
            textContentType: "username",
            autoComplete: "name",
            error: fieldErrors.displayName,
          },
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
            textContentType: "newPassword",
            autoComplete: "password-new",
            error: fieldErrors.password,
          },
          {
            placeholder: "Confirm password",
            value: confirmPassword,
            onChangeText: (text: string) => {
              setConfirmPassword(text);
              clearFieldError("confirmPassword");
            },
            secureTextEntry: true,
            autoCapitalize: "none",
            autoCorrect: false,
            textContentType: "newPassword",
            autoComplete: "password-new",
            error: fieldErrors.confirmPassword,
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

      {/* Create Account button */}
      <Pressable
        disabled={isSubmitting}
        onPress={handleSignUp}
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
          CREATE ACCOUNT
        </Text>
      </Pressable>

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
          Already have an account?
        </Text>
        <Link href="/(auth)/login" asChild>
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
              LOG IN
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
