import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { PrimaryButton } from "@/design/primitives/primary-button";
import { colorTokens } from "@/design/tokens/color";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyTokens } from "@/design/tokens/typography";
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
  const [isSuccess, setIsSuccess] = useState(false);

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

      setIsSuccess(true);
      router.replace("/(app)/home-preview");
    })();
  };

  return (
    <AuthScreenShell
      title="Set a new password"
      subtitle="Use a strong password to keep your account secure."
      footer={
        <View style={{ gap: spacingTokens.sm }}>
          <Text
            selectable
            style={[
              typographyTokens.caption,
              { color: colorTokens.text.muted },
            ]}
          >
            This screen works only with an active recovery session.
          </Text>
          <PrimaryButton
            label="Update Password"
            disabled={isSubmitting || isAuthLoading || !session || isSuccess}
            onPress={handleUpdatePassword}
          />
        </View>
      }
    >
      {!session && !isAuthLoading ? (
        <View style={{ gap: spacingTokens.sm }}>
          <Text
            selectable
            style={[
              typographyTokens.body,
              { color: colorTokens.text.secondary },
            ]}
          >
            Recovery link missing or expired. Request a new one and try again.
          </Text>
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable style={{ alignSelf: "flex-start" }}>
              <Text
                selectable
                style={[
                  typographyTokens.caption,
                  {
                    color: colorTokens.brand.primary,
                    textDecorationLine: "underline",
                  },
                ]}
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
        <Text
          selectable
          style={[typographyTokens.caption, { color: "rgb(176, 48, 48)" }]}
        >
          {formError}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: spacingTokens.xs,
        }}
      >
        <Text
          selectable
          style={[typographyTokens.caption, { color: colorTokens.text.muted }]}
        >
          Need to sign in instead?
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <Text
              selectable
              style={[
                typographyTokens.caption,
                {
                  color: colorTokens.brand.primary,
                  textDecorationLine: "underline",
                },
              ]}
            >
              Back to login
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
