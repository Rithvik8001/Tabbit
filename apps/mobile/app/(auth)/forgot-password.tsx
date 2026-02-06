import { Link } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/features/auth/state/auth-provider";
import { isValidEmail } from "@/features/auth/utils/auth-validation";

const primaryPurple = "#4A29FF";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
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
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: Math.max(insets.top, 8),
      }}
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode={
            process.env.EXPO_OS === "ios" ? "interactive" : "on-drag"
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: Math.max(insets.bottom, 18),
            gap: 20,
          }}
        >
          <View style={{ marginTop: 12, gap: 14 }}>
            <Text
              selectable
              style={{
                color: "#77829A",
                fontSize: 16,
                lineHeight: 20,
                letterSpacing: 1,
                fontWeight: "700",
              }}
            >
              TABBIT / ACCESS
            </Text>

            <View
              style={{
                width: 68,
                height: 2,
                borderRadius: 99,
                backgroundColor: "#E7EAF0",
              }}
            />

            <Text
              selectable
              style={{
                color: "#0E1116",
                fontSize: 58,
                lineHeight: 62,
                letterSpacing: -0.6,
                fontWeight: "600",
              }}
            >
              Reset your password
            </Text>

            <Text
              selectable
              style={{
                color: "#596170",
                fontSize: 19,
                lineHeight: 31,
                letterSpacing: -0.1,
                fontWeight: "500",
              }}
            >
              We will send a secure link to continue in-app.
            </Text>
          </View>

          <View
            style={{
              borderRadius: 22,
              borderCurve: "continuous",
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E8EBF1",
              boxShadow: "0 8px 20px rgba(17, 20, 26, 0.05)",
              padding: 18,
              gap: 16,
            }}
          >
            <Text
              selectable
              style={{
                color: "#68748E",
                fontSize: 16,
                lineHeight: 18,
                letterSpacing: 1.1,
                fontWeight: "700",
              }}
            >
              EMAIL
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@domain.com"
              placeholderTextColor="#A8B2C7"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              selectionColor={primaryPurple}
              style={{
                height: 60,
                borderRadius: 18,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: "#DCE2EC",
                paddingHorizontal: 18,
                color: "#171A20",
                fontSize: 17,
                fontWeight: "500",
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                paddingTop: 4,
              }}
            >
              <Text
                selectable
                style={{
                  color: "#7A849A",
                  fontSize: 16,
                  lineHeight: 20,
                  fontWeight: "500",
                }}
              >
                Remembered your password?
              </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text
                    selectable
                    style={{
                      color: primaryPurple,
                      fontSize: 16,
                      lineHeight: 20,
                      textDecorationLine: "underline",
                      fontWeight: "700",
                    }}
                  >
                    Back to login
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {formError ? (
            <Text
              selectable
              style={{
                color: "#B03030",
                fontSize: 14,
                lineHeight: 18,
                fontWeight: "600",
              }}
            >
              {formError}
            </Text>
          ) : null}

          <View style={{ marginTop: "auto", gap: 12, paddingTop: 12 }}>
            <Text
              selectable
              style={{
                color: "#7A849A",
                fontSize: 16,
                lineHeight: 20,
                fontWeight: "500",
              }}
            >
              {isSent
                ? "If the email exists, a reset link has been sent."
                : "Reset links open directly inside the app."}
            </Text>

            <Pressable
              onPress={handleResetRequest}
              disabled={disableSubmit}
              style={{
                borderRadius: 26,
                borderCurve: "continuous",
                backgroundColor: primaryPurple,
                height: 66,
                alignItems: "center",
                justifyContent: "center",
                opacity: disableSubmit ? 0.6 : 1,
              }}
            >
              <Text
                selectable
                style={{
                  color: "#FFFFFF",
                  fontSize: 22,
                  lineHeight: 22,
                  fontWeight: "700",
                }}
              >
                {isSent ? "Email Sent" : "Send Reset Link"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
