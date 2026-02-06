import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
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
import { isValidPassword } from "@/features/auth/utils/auth-validation";

const primaryPurple = "#4A29FF";

function PasswordInput({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#C9CDD4"
      secureTextEntry
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="newPassword"
      autoComplete="password-new"
      selectionColor={primaryPurple}
      style={{
        height: 60,
        borderRadius: 20,
        borderCurve: "continuous",
        backgroundColor: "#F7F8FA",
        paddingHorizontal: 20,
        color: "#171A20",
        fontSize: 17,
        fontWeight: "600",
      }}
    />
  );
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const disableSubmit = isSubmitting || isAuthLoading || !session || isSuccess;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: Math.max(insets.top, 8) }}>
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: Math.max(insets.bottom, 18),
            gap: 20,
          }}
        >
          <View style={{ gap: 18 }}>
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Image
                source={require("@/assets/images/icon.png")}
                contentFit="contain"
                style={{ width: 88, height: 88, borderRadius: 20 }}
              />
            </View>

            <View style={{ gap: 12 }}>
              <Text
                selectable
                style={{
                  color: "#0E1116",
                  fontSize: 44,
                  lineHeight: 48,
                  letterSpacing: -0.4,
                  fontWeight: "600",
                }}
              >
                Reset your{"\n"}password
              </Text>

              <Text
                selectable
                style={{
                  color: "#596170",
                  fontSize: 18,
                  lineHeight: 29,
                  letterSpacing: -0.08,
                  fontWeight: "500",
                }}
              >
                Choose a strong password and continue to Tabbit.
              </Text>
            </View>
          </View>

          {!session && !isAuthLoading ? (
            <View
              style={{
                borderRadius: 20,
                borderCurve: "continuous",
                backgroundColor: "#F7F8FA",
                padding: 18,
                gap: 10,
              }}
            >
              <Text
                selectable
                style={{
                  color: "#434B59",
                  fontSize: 16,
                  lineHeight: 24,
                  fontWeight: "500",
                }}
              >
                Recovery link missing or expired. Request a new one and try again.
              </Text>

              <Link href="/(auth)/forgot-password" asChild>
                <Pressable style={{ alignSelf: "flex-start", paddingVertical: 6 }}>
                  <Text
                    selectable
                    style={{
                      color: primaryPurple,
                      fontSize: 16,
                      lineHeight: 21,
                      textDecorationLine: "underline",
                      fontWeight: "600",
                    }}
                  >
                    Request another reset link
                  </Text>
                </Pressable>
              </Link>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              <View style={{ gap: 10 }}>
                <Text
                  selectable
                  style={{
                    color: "#0E1116",
                    fontSize: 16,
                    lineHeight: 16,
                    fontWeight: "700",
                  }}
                >
                  New Password
                </Text>
                <PasswordInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimum 8 characters"
                />
              </View>

              <View style={{ gap: 10 }}>
                <Text
                  selectable
                  style={{
                    color: "#0E1116",
                    fontSize: 16,
                    lineHeight: 16,
                    fontWeight: "700",
                  }}
                >
                  Confirm Password
                </Text>
                <PasswordInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat password"
                />
              </View>
            </View>
          )}

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
            <Pressable
              onPress={handleUpdatePassword}
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
                Update Password
              </Text>
            </Pressable>

            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 8 }}>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text
                    selectable
                    style={{
                      color: "#0E1116",
                      fontSize: 17,
                      lineHeight: 22,
                      fontWeight: "700",
                    }}
                  >
                    Back to login
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
