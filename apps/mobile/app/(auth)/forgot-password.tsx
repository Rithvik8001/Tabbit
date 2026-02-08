import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { PrimaryButton } from "@/design/primitives/primary-button";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
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

  const disableSubmit = isSubmitting || isSent;

  return (
    <AuthScreenShell
      title="Reset your password"
      subtitle="We will send a secure recovery link to continue in-app."
      footer={
        <View style={{ gap: spacingTokens.xs }}>
          <PrimaryButton
            visualStyle="premiumAuth"
            label={isSent ? "Email Sent" : "Send Reset Link"}
            disabled={disableSubmit}
            onPress={handleResetRequest}
          />
        </View>
      }
    >
      <AuthTextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@domain.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
      />

      {formError ? (
        <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.state.danger }]}>
          {formError}
        </Text>
      ) : null}

      <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.text.tertiary }]}>
        {isSent
          ? "If this email exists, a reset link has been sent."
          : "Reset links open directly inside the app."}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: spacingTokens.xs }}>
        <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.text.tertiary }]}>
          Remembered your password?
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <Text
              selectable
              style={[typographyScale.labelMd, { color: colorSemanticTokens.accent.primary }]}
            >
              Back to login
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
