import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { PrimaryButton } from "@/design/primitives/primary-button";
import { premiumAuthUiTokens } from "@/design/tokens/auth-ui";
import { AuthScreenShell } from "@/features/auth/components/auth-screen-shell";
import { AuthTextField } from "@/features/auth/components/auth-text-field";
import { useAuth } from "@/features/auth/state/auth-provider";
import {
  isValidEmail,
  isValidPassword,
} from "@/features/auth/utils/auth-validation";

export default function SignupScreen() {
  const router = useRouter();
  const { session, isAuthLoading, signInWithGoogle, signUpWithPassword } =
    useAuth();

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
      router.replace("/(app)/home-preview");
    }
  }, [isAuthLoading, router, session]);

  const handleSignUp = () => {
    if (verificationMessage) {
      router.replace("/(auth)/login");
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
      const result = await signUpWithPassword(email.trim(), password);
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

      router.replace("/(app)/home-preview");
    })();
  };

  const handleGoogleSignUp = () => {
    setFormError(null);
    setIsSubmitting(true);

    void (async () => {
      const result = await signInWithGoogle();
      setIsSubmitting(false);

      if (!result.ok) {
        setFormError(result.message ?? "Google sign in failed.");
        return;
      }

      router.replace("/(app)/home-preview");
    })();
  };

  return (
    <AuthScreenShell
      title="Create your account"
      subtitle="A quieter way to manage shared expenses starts here."
      footer={
        <View style={{ gap: premiumAuthUiTokens.spacing.xs }}>
          <Text
            selectable
            style={[
              premiumAuthUiTokens.typography.caption,
              { color: premiumAuthUiTokens.color.textMuted },
            ]}
          >
            {verificationMessage
              ? "Email confirmation is required before login."
              : "By continuing, you agree to Tabbit's terms and privacy policy."}
          </Text>
          <PrimaryButton
            visualStyle="premiumAuth"
            label={verificationMessage ? "Go to Login" : "Create Account"}
            disabled={isSubmitting}
            onPress={handleSignUp}
          />
        </View>
      }
    >
      {verificationMessage ? (
        <View style={{ gap: premiumAuthUiTokens.spacing.xs }}>
          <Text
            selectable
            style={[
              premiumAuthUiTokens.typography.body,
              { color: premiumAuthUiTokens.color.textSecondary },
            ]}
          >
            {verificationMessage}
          </Text>
        </View>
      ) : (
        <>
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
          <AuthTextField
            label="Password"
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

          {formError ? (
            <Text
              selectable
              style={[
                premiumAuthUiTokens.typography.caption,
                { color: premiumAuthUiTokens.color.error },
              ]}
            >
              {formError}
            </Text>
          ) : null}

          <View
            style={{
              marginTop: premiumAuthUiTokens.spacing.xs,
              gap: premiumAuthUiTokens.spacing.sm,
            }}
          >
            <View
              style={{
                height: 1,
                backgroundColor: premiumAuthUiTokens.color.divider,
              }}
            />
            <PrimaryButton
              visualStyle="premiumAuth"
              label="Continue with Google"
              variant="secondary"
              disabled={isSubmitting}
              onPress={handleGoogleSignUp}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: premiumAuthUiTokens.spacing.xs,
              paddingTop: premiumAuthUiTokens.spacing.xs,
            }}
          >
            <Text
              selectable
              style={[
                premiumAuthUiTokens.typography.caption,
                { color: premiumAuthUiTokens.color.textMuted },
              ]}
            >
              Already have an account?
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text
                  selectable
                  style={[
                    premiumAuthUiTokens.typography.link,
                    {
                      color: premiumAuthUiTokens.color.accent,
                      textDecorationLine: "underline",
                    },
                  ]}
                >
                  Log in
                </Text>
              </Pressable>
            </Link>
          </View>
        </>
      )}
    </AuthScreenShell>
  );
}
