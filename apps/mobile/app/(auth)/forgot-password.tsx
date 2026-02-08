import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthInputGroup } from "@/features/auth/components/auth-input-group";
import { AuthScreenShell } from "@/features/auth/components/auth-screen-shell";
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
    <AuthScreenShell title="Reset your password">
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

      <Text
        style={{
          fontSize: 13,
          fontWeight: "400",
          color: "#AFAFAF",
          textAlign: "center",
        }}
      >
        {isSent
          ? "If this email exists, a reset link has been sent."
          : "We'll send a secure recovery link to your email."}
      </Text>

      {/* Send Reset Link button */}
      <Pressable
        disabled={disableSubmit}
        onPress={handleResetRequest}
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
          {isSent ? "EMAIL SENT" : "SEND RESET LINK"}
        </Text>
      </Pressable>

      {/* Back to login */}
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
          Remembered your password?
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
              BACK TO LOGIN
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
