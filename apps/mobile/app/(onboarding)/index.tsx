import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colorTokens } from "@/design/tokens/color";
import { useAuth } from "@/features/auth/state/auth-provider";
import {
  getDisplayNameValidationMessage,
  normalizeDisplayName,
  isValidEmail,
  isValidPassword,
} from "@/features/auth/utils/auth-validation";

type AuthModalType = "signup" | "login" | null;

const primaryPurple = "#4A29FF";

function CloseIcon() {
  return (
    <View style={{ width: 18, height: 18, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          position: "absolute",
          width: 18,
          height: 3,
          borderRadius: 99,
          backgroundColor: "#9AA0AA",
          transform: [{ rotate: "45deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 18,
          height: 3,
          borderRadius: 99,
          backgroundColor: "#9AA0AA",
          transform: [{ rotate: "-45deg" }],
        }}
      />
    </View>
  );
}

function lunaInput(
  value: string,
  onChangeText: (text: string) => void,
  placeholder: string,
  secureTextEntry = false,
  autoCapitalize: "none" | "sentences" | "words" | "characters" = "none",
) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#C9CDD4"
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
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

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const {
    isAuthLoading,
    requestPasswordReset,
    session,
    signInWithPassword,
    signUpWithPassword,
  } = useAuth();

  const [activeModal, setActiveModal] = useState<AuthModalType>(null);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupMessage, setSignupMessage] = useState<string | null>(null);
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.replace("/(app)/(tabs)/(home)");
    }
  }, [isAuthLoading, router, session]);

  const closeModal = () => {
    setActiveModal(null);
    setSignupError(null);
    setSignupMessage(null);
    setLoginError(null);
  };

  const handleSignup = () => {
    const displayNameMessage = getDisplayNameValidationMessage(signupName);
    if (displayNameMessage) {
      setSignupError(displayNameMessage);
      return;
    }

    if (!isValidEmail(signupEmail)) {
      setSignupError("Enter a valid email address");
      return;
    }

    if (!isValidPassword(signupPassword)) {
      setSignupError("Password must be at least 8 characters");
      return;
    }

    if (signupConfirm !== signupPassword) {
      setSignupError("Passwords do not match");
      return;
    }

    setSignupError(null);
    setIsSignupSubmitting(true);

    void (async () => {
      const result = await signUpWithPassword(
        normalizeDisplayName(signupName),
        signupEmail.trim(),
        signupPassword,
      );
      setIsSignupSubmitting(false);

      if (!result.ok) {
        setSignupError(result.message ?? "Unable to create account");
        return;
      }

      if (result.requiresEmailVerification) {
        setSignupMessage(
          result.message ?? "Check your inbox and confirm your email before login.",
        );
        return;
      }

      closeModal();
      router.replace("/(app)/(tabs)/(home)");
    })();
  };

  const handleLogin = () => {
    if (!isValidEmail(loginEmail)) {
      setLoginError("Enter a valid email address");
      return;
    }

    if (!loginPassword) {
      setLoginError("Enter your password");
      return;
    }

    setLoginError(null);
    setIsLoginSubmitting(true);

    void (async () => {
      const result = await signInWithPassword(loginEmail.trim(), loginPassword);
      setIsLoginSubmitting(false);

      if (!result.ok) {
        setLoginError(result.message ?? "Unable to sign in");
        return;
      }

      closeModal();
      router.replace("/(app)/(tabs)/(home)");
    })();
  };

  const handleForgotPassword = () => {
    const defaultEmail = loginEmail.trim();

    const executeReset = (value: string) => {
      const email = value.trim();

      if (!isValidEmail(email)) {
        Alert.alert("Invalid Email", "Enter a valid email address.");
        return;
      }

      void (async () => {
        const result = await requestPasswordReset(email);
        if (!result.ok) {
          Alert.alert(
            "Error",
            result.message ?? "Failed to send password reset email.",
          );
          return;
        }

        Alert.alert(
          "Reset Link Sent",
          "If this email exists, a reset link has been sent.",
        );
      })();
    };

    if (process.env.EXPO_OS === "ios") {
      Alert.prompt(
        "Reset Password",
        "Enter your email address and we will send you a link to reset your password.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reset",
            onPress: (value?: string) => {
              executeReset(value ?? defaultEmail);
            },
          },
        ],
        "plain-text",
        defaultEmail,
        "email-address",
      );
      return;
    }

    Alert.alert(
      "Reset Password",
      "Open the forgot-password screen to reset your password.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            closeModal();
            router.push("/(auth)/forgot-password");
          },
        },
      ],
    );
  };

  const modalTitle = activeModal === "signup" ? "Let’s get started" : "Welcome back";
  const modalEmoji = activeModal === "signup" ? "🕺" : "👋";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: Math.max(insets.top, 8),
      }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 40,
        }}
      >
        <View
          style={{
            marginTop: height < 760 ? 20 : 48,
            alignItems: "center",
          }}
        >
          <Image
            source={require("@/assets/images/icon.png")}
            contentFit="contain"
            style={{ width: 116, height: 116, borderRadius: 26 }}
          />
        </View>

        <View
          style={{
            marginTop: height < 760 ? 28 : 42,
            gap: 18,
          }}
        >
          <Text
            selectable
            style={{
              color: "#0E1116",
              fontSize: 56,
              lineHeight: 60,
              letterSpacing: -0.6,
              fontWeight: "600",
            }}
          >
            Welcome{"\n"}to Tabbit 👋
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
            A simple and beautiful expense app to track shared costs with friends,
            roommates, and trips.
          </Text>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: Math.max(insets.bottom, 14),
          gap: 14,
        }}
      >
        <Pressable
          onPress={() => {
            setActiveModal("signup");
          }}
          style={{
            borderRadius: 26,
            borderCurve: "continuous",
            backgroundColor: primaryPurple,
            height: 70,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            selectable
            style={{
              color: "#FFFFFF",
              fontSize: 23,
              lineHeight: 23,
              fontWeight: "700",
            }}
          >
            Create an Account
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setActiveModal("login");
          }}
          style={{
            borderRadius: 26,
            borderCurve: "continuous",
            backgroundColor: "#F4F5F7",
            height: 70,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            selectable
            style={{
              color: "#0E1116",
              fontSize: 23,
              lineHeight: 23,
              fontWeight: "700",
            }}
          >
            Log in
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={Boolean(activeModal)}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(20, 24, 32, 0.14)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              height: Math.min(Math.max(height * 0.86, 600), 860),
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 42,
              borderTopRightRadius: 42,
              borderCurve: "continuous",
              paddingTop: 14,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                paddingHorizontal: 22,
                paddingBottom: 8,
              }}
            >
              <Pressable
                onPress={closeModal}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F7F7F8",
                }}
              >
                <CloseIcon />
              </Pressable>
            </View>

            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              automaticallyAdjustKeyboardInsets
              keyboardDismissMode={process.env.EXPO_OS === "ios" ? "interactive" : "on-drag"}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: Math.max(insets.bottom + 28, 40),
                gap: 20,
              }}
            >
              <View style={{ alignItems: "center", gap: 14 }}>
                <Image
                  source={require("@/assets/images/icon.png")}
                  contentFit="contain"
                  style={{ width: 96, height: 96, borderRadius: 20 }}
                />
                <Text
                  selectable
                  style={{
                    color: "#0E1116",
                    fontSize: 27,
                    lineHeight: 27,
                    fontWeight: "700",
                  }}
                >
                  {modalTitle} {modalEmoji}
                </Text>
              </View>

              {activeModal === "signup" ? (
                <>
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
                      Username *
                    </Text>
                    <Text
                      selectable
                      style={{
                        color: "#737C8D",
                        fontSize: 13,
                        lineHeight: 16,
                        fontWeight: "600",
                      }}
                    >
                      Required
                    </Text>
                    {lunaInput(
                      signupName,
                      setSignupName,
                      "What should we call you?",
                      false,
                      "words",
                    )}
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
                      Email
                    </Text>
                    {lunaInput(signupEmail, setSignupEmail, "Your email")}
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
                      Password
                    </Text>
                    {lunaInput(signupPassword, setSignupPassword, "Your password", true)}
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
                    {lunaInput(signupConfirm, setSignupConfirm, "One more time", true)}
                  </View>

                  {signupError ? (
                    <Text
                      selectable
                      style={{
                        color: "#B03030",
                        fontSize: 14,
                        lineHeight: 18,
                        fontWeight: "600",
                      }}
                    >
                      {signupError}
                    </Text>
                  ) : null}

                  {signupMessage ? (
                    <Text
                      selectable
                      style={{
                        color: colorTokens.text.secondary,
                        fontSize: 14,
                        lineHeight: 18,
                        fontWeight: "600",
                      }}
                    >
                      {signupMessage}
                    </Text>
                  ) : null}

                  <Pressable
                    onPress={handleSignup}
                    disabled={isSignupSubmitting}
                    style={{
                      marginTop: 8,
                      borderRadius: 26,
                      borderCurve: "continuous",
                      backgroundColor: primaryPurple,
                      height: 66,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isSignupSubmitting ? 0.6 : 1,
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
                      Create account
                    </Text>
                  </Pressable>
                </>
              ) : null}

              {activeModal === "login" ? (
                <>
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
                      Email
                    </Text>
                    {lunaInput(loginEmail, setLoginEmail, "Your email")}
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
                      Password
                    </Text>
                    {lunaInput(loginPassword, setLoginPassword, "Your password", true)}
                  </View>

                  {loginError ? (
                    <Text
                      selectable
                      style={{
                        color: "#B03030",
                        fontSize: 14,
                        lineHeight: 18,
                        fontWeight: "600",
                      }}
                    >
                      {loginError}
                    </Text>
                  ) : null}

                  <Pressable
                    onPress={handleLogin}
                    disabled={isLoginSubmitting}
                    style={{
                      marginTop: 8,
                      borderRadius: 26,
                      borderCurve: "continuous",
                      backgroundColor: primaryPurple,
                      height: 66,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isLoginSubmitting ? 0.6 : 1,
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
                      Sign In
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleForgotPassword}
                    style={{
                      marginTop: 4,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      selectable
                      style={{
                        color: "#0E1116",
                        fontSize: 17,
                        lineHeight: 22,
                        fontWeight: "700",
                      }}
                    >
                      Forgot password?
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
