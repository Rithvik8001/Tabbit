import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { PrimaryButton } from "@/design/primitives/primary-button";
import { premiumAuthUiTokens } from "@/design/tokens/auth-ui";
import { AuthScreenShell } from "@/features/auth/components/auth-screen-shell";
import { AuthTextField } from "@/features/auth/components/auth-text-field";
import { useAuth } from "@/features/auth/state/auth-provider";
import { isValidEmail } from "@/features/auth/utils/auth-validation";

export default function LoginScreen() {
  const router = useRouter();
  const { session, isAuthLoading, signInWithGoogle, signInWithPassword } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.replace("/(app)/home-preview");
    }
  }, [isAuthLoading, router, session]);

  const handleLogin = () => {
    if (!isValidEmail(email)) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (password.length === 0) {
      setFormError("Enter your password.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    void (async () => {
      const result = await signInWithPassword(email.trim(), password);
      setIsSubmitting(false);

      if (!result.ok) {
        setFormError(result.message ?? "Unable to log in.");
        return;
      }

      router.replace("/(app)/home-preview");
    })();
  };

  const handleGoogleLogin = () => {
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
      title="Welcome back"
      subtitle="Pick up exactly where your shared balances left off."
      footer={
        <View style={{ gap: premiumAuthUiTokens.spacing.xs }}>
          <Text
            selectable
            style={[
              premiumAuthUiTokens.typography.caption,
              { color: premiumAuthUiTokens.color.textMuted },
            ]}
          >
            Email/password and Google are both supported.
          </Text>
          <PrimaryButton
            visualStyle="premiumAuth"
            label="Log In"
            disabled={isSubmitting}
            onPress={handleLogin}
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
      <AuthTextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        autoComplete="password"
        placeholder="Your password"
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
          onPress={handleGoogleLogin}
        />
      </View>

      <Link href="/(auth)/forgot-password" asChild>
        <Pressable style={{ alignSelf: "center" }}>
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
            Forgot password?
          </Text>
        </Pressable>
      </Link>

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
          New to Tabbit?
        </Text>
        <Link href="/(auth)/signup" asChild>
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
              Create account
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
