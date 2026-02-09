import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";

import { Button } from "@/design/primitives/button";
import { colorSemanticTokens } from "@/design/tokens/colors";
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
            color: colorSemanticTokens.text.primary,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Recovery link missing or expired. Request a new link and try again.
        </Text>
        <Link href="/(auth)/forgot-password" asChild>
          <Pressable>
            <Button label="Request new link" size="lg" />
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
            color: colorSemanticTokens.state.danger,
            textAlign: "center",
          }}
        >
          {formError}
        </Text>
      ) : null}

      <Button
        label="Update password"
        onPress={handleUpdatePassword}
        loading={isSubmitting}
        disabled={disableSubmit}
        size="lg"
      />

      <Link href="/(auth)/login" asChild>
        <Pressable style={{ alignSelf: "center", paddingTop: 8 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colorSemanticTokens.accent.primary,
            }}
          >
            Back to login
          </Text>
        </Pressable>
      </Link>
    </AuthScreenShell>
  );
}
