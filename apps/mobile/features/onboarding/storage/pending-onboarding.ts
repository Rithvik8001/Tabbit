import AsyncStorage from "@react-native-async-storage/async-storage";

import type { PendingOnboardingPayload } from "@/features/auth/types/auth.types";

const PENDING_ONBOARDING_KEY = "tabbit.pending-onboarding";

export async function setPendingOnboarding(
  payload: PendingOnboardingPayload,
): Promise<void> {
  await AsyncStorage.setItem(PENDING_ONBOARDING_KEY, JSON.stringify(payload));
}

export async function getPendingOnboarding(): Promise<PendingOnboardingPayload | null> {
  const rawValue = await AsyncStorage.getItem(PENDING_ONBOARDING_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as PendingOnboardingPayload;
  } catch {
    await AsyncStorage.removeItem(PENDING_ONBOARDING_KEY);
    return null;
  }
}

export async function clearPendingOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_ONBOARDING_KEY);
}
