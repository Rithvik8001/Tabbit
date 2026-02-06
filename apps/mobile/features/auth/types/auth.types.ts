import type {
  SplitStyle,
  UseContext,
} from "@/features/onboarding/types/onboarding.types";

export type AuthErrorCode =
  | "validation"
  | "invalid_credentials"
  | "email_not_confirmed"
  | "rate_limited"
  | "network"
  | "oauth_cancelled"
  | "oauth_failed"
  | "recovery_link_invalid"
  | "unknown";

export type AuthActionResult = {
  ok: boolean;
  code?: AuthErrorCode;
  message?: string;
  requiresEmailVerification?: boolean;
};

export type PendingOnboardingPayload = {
  splitStyle: SplitStyle;
  useContext: UseContext;
  displayName: string | null;
  createdAt: string;
};
