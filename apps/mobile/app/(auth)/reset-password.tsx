import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";

import { AuthInputGroup } from "@/features/auth/components/auth-input-group";
import { AuthScreenShell } from "@/features/auth/components/auth-screen-shell";
import { useAuth } from "@/features/auth/state/auth-provider";
import { isValidPassword } from "@/features/auth/utils/auth-validation";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { isAuthLoading, session, updatePassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleUpdatePassword = () => {
    if (!session) {
      setFormError("This recovery link is invalid or expired.");
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
      const result = await updatePassword(password);
      setIsSubmitting(false);

      if (!result.ok) {
        setFormError(result.message ?? "Unable to update password.");
        return;
      }

      router.replace("/(app)/(tabs)/(home)");
    })();
  };

  const disableSubmit = isSubmitting || isAuthLoading || !session;

  if (!session && !isAuthLoading) {
    return (
      <AuthScreenShell title="Link expired">
        <Text
          style={{
            fontSize: 15,
            fontWeight: "400",
            color: "#3C3C3C",
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Recovery link missing or expired. Request a new link and try again.
        </Text>
        <Link href="/(auth)/forgot-password" asChild>
          <Pressable
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
              REQUEST NEW LINK
            </Text>
          </Pressable>
        </Link>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell title="Set a new password">
      <AuthInputGroup
        fields={[
          {
            placeholder: "New password",
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

      {/* Update Password button */}
      <Pressable
        disabled={disableSubmit}
        onPress={handleUpdatePassword}
        style={{
          backgroundColor: "#1CB0F6",
          borderRadius: 16,
          borderCurve: "continuous",
          minHeight: 50,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 14,
          opacity: disableSubmit ? 0.5 : 1,
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
          UPDATE PASSWORD
        </Text>
      </Pressable>

      {/* Back to login */}
      <Link href="/(auth)/login" asChild>
        <Pressable style={{ alignSelf: "center", paddingTop: 8 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#1CB0F6",
              textTransform: "uppercase",
              letterSpacing: 0.2,
            }}
          >
            BACK TO LOGIN
          </Text>
        </Pressable>
      </Link>
    </AuthScreenShell>
  );
}
