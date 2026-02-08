import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthInputGroup } from "@/features/auth/components/auth-input-group";
import { AuthScreenShell } from "@/features/auth/components/auth-screen-shell";
import { useAuth } from "@/features/auth/state/auth-provider";
import {
  getDisplayNameValidationMessage,
  normalizeDisplayName,
  isValidEmail,
  isValidPassword,
} from "@/features/auth/utils/auth-validation";

export default function SignupScreen() {
  const router = useRouter();
  const { session, isAuthLoading, signUpWithPassword } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.replace("/(app)/(tabs)/(home)");
    }
  }, [isAuthLoading, router, session]);

  const handleSignUp = () => {
    if (verificationMessage) {
      router.replace("/(auth)/login");
      return;
    }

    const displayNameMessage = getDisplayNameValidationMessage(displayName);
    if (displayNameMessage) {
      setFormError(displayNameMessage);
      return;
    }

    if (!isValidEmail(email)) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    if (confirmPassword !== password) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    void (async () => {
      const result = await signUpWithPassword(
        normalizeDisplayName(displayName),
        email.trim(),
        password,
      );
      setIsSubmitting(false);

      if (!result.ok) {
        setFormError(result.message ?? "Unable to create account.");
        return;
      }

      if (result.requiresEmailVerification) {
        setVerificationMessage(
          result.message ??
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
            backgroundColor: "#E5E5E5",
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
              color: "#AFAFAF",
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
            onChangeText: setDisplayName,
            autoCapitalize: "words",
            autoCorrect: false,
            textContentType: "username",
            autoComplete: "name",
          },
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
            textContentType: "newPassword",
            autoComplete: "password-new",
          },
          {
            placeholder: "Confirm password",
            value: confirmPassword,
            onChangeText: setConfirmPassword,
            secureTextEntry: true,
            autoCapitalize: "none",
            autoCorrect: false,
            textContentType: "newPassword",
            autoComplete: "password-new",
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

      {/* Create Account button */}
      <Pressable
        disabled={isSubmitting}
        onPress={handleSignUp}
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
