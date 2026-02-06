import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

import { supabase } from "@/features/auth/lib/supabase-client";
import type { AuthActionResult } from "@/features/auth/types/auth.types";
import { mapAuthError } from "@/features/auth/utils/auth-errors";
import {
  parseAuthSessionFromUrl,
  isSupportedAuthUrl,
} from "@/features/auth/utils/auth-callback";
import {
  AUTH_CALLBACK_URL,
  RESET_PASSWORD_URL,
} from "@/features/auth/utils/auth-urls";
import {
  clearPendingOnboarding,
  getPendingOnboarding,
} from "@/features/onboarding/storage/pending-onboarding";

void WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isAuthLoading: boolean;
  signInWithPassword: (
    email: string,
    password: string,
  ) => Promise<AuthActionResult>;
  signUpWithPassword: (
    email: string,
    password: string,
  ) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<AuthActionResult>;
  requestPasswordReset: (email: string) => Promise<AuthActionResult>;
  updatePassword: (nextPassword: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const onboardingSyncAttemptedByUserId = useRef<Set<string>>(new Set());

  const applySessionFromAuthUrl = useCallback(async (url: string) => {
    if (!isSupportedAuthUrl(url)) {
      return;
    }

    const parsedSession = parseAuthSessionFromUrl(url);
    if (!parsedSession) {
      return;
    }

    await supabase.auth.setSession({
      access_token: parsedSession.accessToken,
      refresh_token: parsedSession.refreshToken,
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setIsAuthLoading(false);
    };

    void hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === "active") {
        void supabase.auth.startAutoRefresh();
      } else {
        void supabase.auth.stopAutoRefresh();
      }
    };

    handleAppStateChange(AppState.currentState);

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const syncInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await applySessionFromAuthUrl(initialUrl);
      }
    };

    void syncInitialUrl();

    const linkingSubscription = Linking.addEventListener("url", (event) => {
      void applySessionFromAuthUrl(event.url);
    });

    return () => {
      linkingSubscription.remove();
    };
  }, [applySessionFromAuthUrl]);

  useEffect(() => {
    const activeUserId = session?.user.id;

    if (!activeUserId) {
      return;
    }

    if (onboardingSyncAttemptedByUserId.current.has(activeUserId)) {
      return;
    }

    onboardingSyncAttemptedByUserId.current.add(activeUserId);

    const persistPendingPreferences = async () => {
      const pendingOnboarding = await getPendingOnboarding();
      if (!pendingOnboarding) {
        return;
      }

      const { error } = await supabase.from("profiles").upsert(
        {
          id: activeUserId,
          email: session?.user.email ?? null,
          split_style: pendingOnboarding.splitStyle,
          use_context: pendingOnboarding.useContext,
          display_name: pendingOnboarding.displayName ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (!error) {
        await clearPendingOnboarding();
      }
    };

    void persistPendingPreferences();
  }, [session?.user.email, session?.user.id]);

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return mapAuthError(error);
      }

      return { ok: true };
    },
    [],
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        return mapAuthError(error);
      }

      if (!data.session) {
        return {
          ok: true,
          requiresEmailVerification: true,
          message: "Check your inbox and confirm your email before logging in.",
        };
      }

      return { ok: true };
    },
    [],
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthActionResult> => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: AUTH_CALLBACK_URL,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      return mapAuthError(error);
    }

    if (!data?.url) {
      return {
        ok: false,
        code: "oauth_failed",
        message: "Unable to start Google sign in.",
      };
    }

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      AUTH_CALLBACK_URL,
    );

    if (result.type !== "success" || !("url" in result)) {
      const { data: currentSessionData } = await supabase.auth.getSession();
      if (currentSessionData.session) {
        return { ok: true };
      }

      return {
        ok: false,
        code: "oauth_cancelled",
        message:
          result.type === "cancel" || result.type === "dismiss"
            ? "Google sign in was canceled."
            : "Google sign in could not be completed.",
      };
    }

    const parsedSession = parseAuthSessionFromUrl(result.url);
    if (!parsedSession) {
      return {
        ok: false,
        code: "oauth_failed",
        message: "Google sign in did not return a valid session.",
      };
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: parsedSession.accessToken,
      refresh_token: parsedSession.refreshToken,
    });

    if (sessionError) {
      return mapAuthError(sessionError);
    }

    return { ok: true };
  }, []);

  const requestPasswordReset = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: RESET_PASSWORD_URL,
        },
      );

      if (error) {
        return mapAuthError(error);
      }

      return { ok: true };
    },
    [],
  );

  const updatePassword = useCallback(
    async (nextPassword: string): Promise<AuthActionResult> => {
      const { error } = await supabase.auth.updateUser({
        password: nextPassword,
      });

      if (error) {
        return mapAuthError(error);
      }

      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return mapAuthError(error);
    }

    return { ok: true };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      user,
      isAuthLoading,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      requestPasswordReset,
      updatePassword,
      signOut,
    };
  }, [
    isAuthLoading,
    requestPasswordReset,
    session,
    signInWithGoogle,
    signInWithPassword,
    signOut,
    signUpWithPassword,
    updatePassword,
    user,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
