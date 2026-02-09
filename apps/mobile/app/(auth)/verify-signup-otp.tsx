import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text } from "react-native";

import { AuthInputGroup } from "@/features/auth/components/auth-input-group";
import { AuthScreenShell } from "@/features/auth/components/auth-screen-shell";
import { useAuth } from "@/features/auth/state/auth-provider";

const RESEND_COOLDOWN_SECONDS = 30;

function getParamValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? "*"}*@${domain}`;
  }

  return `${localPart[0]}${"*".repeat(localPart.length - 2)}${localPart[localPart.length - 1]}@${domain}`;
}

export default function VerifySignupOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const emailFromParams = getParamValue(params.email);
  const email = useMemo(() => emailFromParams?.trim() ?? "", [emailFromParams]);
  const { session, isAuthLoading, verifySignupOtp, resendSignupOtp } = useAuth();

  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSecondsRemaining, setResendSecondsRemaining] = useState(
    RESEND_COOLDOWN_SECONDS,
  );

  useEffect(() => {
    if (!email) {
      setFormError("Missing verification email. Please sign up again.");
      return;
    }

    setFormError(null);
  }, [email]);

  useEffect(() => {
    if (!isAuthLoading && session) {
      router.replace("/(app)/(tabs)/(home)");
    }
  }, [isAuthLoading, router, session]);

  useEffect(() => {
    if (resendSecondsRemaining <= 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setResendSecondsRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [resendSecondsRemaining]);

  const handleVerifyCode = () => {
    if (!email) {
      setFormError("Missing verification email. Please sign up again.");
      return;
    }

    if (code.length !== 6) {
      setFormError("Enter the 6-digit code from your email.");
      return;
    }

    setFormError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    void (async () => {
      const result = await verifySignupOtp(email, code);
      setIsSubmitting(false);

      if (!result.ok) {
        setFormError(result.message ?? "Unable to verify code.");
        return;
      }

      if (result.requiresSignIn) {
        router.replace("/(auth)/login?verified=1");
        return;
      }

      router.replace("/(app)/(tabs)/(home)");
    })();
  };

  const handleResendCode = () => {
    if (!email) {
      setFormError("Missing verification email. Please sign up again.");
      return;
    }

    if (resendSecondsRemaining > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setFormError(null);
    setInfoMessage(null);

    void (async () => {
      const result = await resendSignupOtp(email);
      setIsResending(false);

      if (!result.ok) {
        setFormError(result.message ?? "Unable to resend code.");
        return;
      }

      setInfoMessage(result.message ?? "A new verification code has been sent.");
      setResendSecondsRemaining(RESEND_COOLDOWN_SECONDS);
    })();
  };

  const disableVerify = isSubmitting || isResending || code.length !== 6;
  const resendLabel =
    resendSecondsRemaining > 0
      ? `RESEND CODE IN ${resendSecondsRemaining}s`
      : isResending
        ? "SENDING CODE..."
        : "RESEND CODE";

  return (
    <AuthScreenShell title="Verify your email">
      <Text
        style={{
          fontSize: 14,
          fontWeight: "400",
          color: "#6B6B6B",
          textAlign: "center",
          lineHeight: 21,
        }}
      >
        Enter the 6-digit code sent to {email ? maskEmail(email) : "your email"}.
      </Text>

      <AuthInputGroup
        fields={[
          {
            placeholder: "6-digit code",
            value: code,
            onChangeText: (text: string) => {
              const normalized = text.replace(/\D/g, "").slice(0, 6);
              setCode(normalized);
              if (formError) {
                setFormError(null);
              }
            },
            keyboardType: "number-pad",
            textContentType: "oneTimeCode",
            autoComplete: "one-time-code",
            maxLength: 6,
            error: formError ?? undefined,
          },
        ]}
      />

      {infoMessage ? (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "400",
            color: "#58CC02",
            textAlign: "center",
          }}
        >
          {infoMessage}
        </Text>
      ) : null}

      <Pressable
        disabled={disableVerify}
        onPress={handleVerifyCode}
        style={{
          backgroundColor: "#1CB0F6",
          borderRadius: 16,
          borderCurve: "continuous",
          minHeight: 50,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 14,
          opacity: disableVerify ? 0.5 : 1,
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
          VERIFY CODE
        </Text>
      </Pressable>

      <Pressable
        disabled={resendSecondsRemaining > 0 || isResending}
        onPress={handleResendCode}
        style={{
          alignSelf: "center",
          opacity: resendSecondsRemaining > 0 || isResending ? 0.5 : 1,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: "#1CB0F6",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {resendLabel}
        </Text>
      </Pressable>

      <Link href="/(auth)/signup" asChild>
        <Pressable style={{ alignSelf: "center" }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#1CB0F6",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            BACK TO SIGN UP
          </Text>
        </Pressable>
      </Link>
    </AuthScreenShell>
  );
}
