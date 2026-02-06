import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { PrimaryButton } from "@/design/primitives/primary-button";
import { colorTokens } from "@/design/tokens/color";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyTokens } from "@/design/tokens/typography";
import { AuthScreenShell } from "@/features/auth/components/auth-screen-shell";
import { AuthTextField } from "@/features/auth/components/auth-text-field";
import { useAuth } from "@/features/auth/state/auth-provider";
import { isValidEmail } from "@/features/auth/utils/auth-validation";

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const handleResetRequest = () => {
    if (!isValidEmail(email)) {
      setFormError("Enter a valid email address.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    void (async () => {
      const result = await requestPasswordReset(email.trim());
      setIsSubmitting(false);

      if (!result.ok) {
        setFormError(result.message ?? "Unable to send reset email.");
        return;
      }

      setIsSent(true);
    })();
  };

  return (
    <AuthScreenShell
      title="Reset your password"
      subtitle="We will send a secure link to continue in-app."
      footer={
        <View style={{ gap: spacingTokens.sm }}>
          <Text
            selectable
            style={[
              typographyTokens.caption,
              { color: colorTokens.text.muted },
            ]}
          >
            {isSent
              ? "If the email exists, a reset link has been sent."
              : "Reset links open directly inside the app."}
          </Text>
          <PrimaryButton
            label={isSent ? "Email Sent" : "Send Reset Link"}
            disabled={isSubmitting || isSent}
            onPress={handleResetRequest}
          />
        </View>
      }
    >
      <AuthTextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        placeholder="you@domain.com"
      />

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
          Remembered your password?
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
