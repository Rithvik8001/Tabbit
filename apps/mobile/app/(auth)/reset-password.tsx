import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { PrimaryButton } from "@/design/primitives/primary-button";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { AuthScreenShell } from "@/features/auth/components/auth-screen-shell";
import { AuthTextField } from "@/features/auth/components/auth-text-field";
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

  return (
    <AuthScreenShell
      title="Set a new password"
      subtitle="Choose a secure password and continue to your dashboard."
      footer={
        <View style={{ gap: spacingTokens.xs }}>
          <PrimaryButton
            visualStyle="premiumAuth"
            label="Update Password"
            disabled={disableSubmit}
            onPress={handleUpdatePassword}
          />
        </View>
      }
    >
      {!session && !isAuthLoading ? (
        <View style={{ gap: spacingTokens.sm }}>
          <Text selectable style={[typographyScale.bodyMd, { color: colorSemanticTokens.text.secondary }]}>
            Recovery link missing or expired. Request a new link and try again.
          </Text>
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable>
              <Text
                selectable
                style={[typographyScale.labelMd, { color: colorSemanticTokens.accent.primary }]}
              >
                Request another reset link
              </Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <>
          <AuthTextField
            label="New Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            autoComplete="password-new"
            placeholder="Minimum 8 characters"
          />
          <AuthTextField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            autoComplete="password-new"
            placeholder="Repeat password"
          />
        </>
      )}

      {formError ? (
        <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.state.danger }]}>
          {formError}
        </Text>
      ) : null}

      <Link href="/(auth)/login" asChild>
        <Pressable style={{ alignSelf: "flex-start", paddingVertical: 4 }}>
          <Text selectable style={[typographyScale.labelMd, { color: colorSemanticTokens.text.primary }]}>
            Back to login
          </Text>
        </Pressable>
      </Link>
    </AuthScreenShell>
  );
}
