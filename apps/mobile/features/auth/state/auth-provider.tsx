import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import { RESET_PASSWORD_URL } from "@/features/auth/utils/auth-urls";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isAuthLoading: boolean;
  signInWithPassword: (
    email: string,
    password: string,
  ) => Promise<AuthActionResult>;
  signUpWithPassword: (
    displayName: string,
    email: string,
    password: string,
  ) => Promise<AuthActionResult>;
  verifySignupOtp: (email: string, code: string) => Promise<AuthActionResult>;
  resendSignupOtp: (email: string) => Promise<AuthActionResult>;
  requestPasswordReset: (email: string) => Promise<AuthActionResult>;
  updatePassword: (nextPassword: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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
    async (
      displayName: string,
      email: string,
      password: string,
    ): Promise<AuthActionResult> => {
      const normalizedEmail = email.trim();

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (error) {
        return mapAuthError(error);
      }

      if (!data.session) {
        return {
          ok: true,
          requiresEmailVerification: true,
          email: normalizedEmail,
          message: "Enter the 6-digit code we emailed you to verify your account.",
        };
      }

      return { ok: true };
    },
    [],
  );

  const verifySignupOtp = useCallback(
    async (email: string, code: string): Promise<AuthActionResult> => {
      const normalizedEmail = email.trim();
      const normalizedCode = code.trim();

      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: normalizedCode,
        type: "signup",
      });

      if (error) {
        return mapAuthError(error);
      }

      const sessionFromResponse = data.session;
      if (sessionFromResponse) {
        return { ok: true };
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        return { ok: true };
      }

      return {
        ok: true,
        requiresSignIn: true,
        message: "Email verified. Log in to continue.",
      };
    },
    [],
  );

  const resendSignupOtp = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) {
        return mapAuthError(error);
      }

      return {
        ok: true,
        message: "A new verification code has been sent.",
      };
    },
    [],
  );

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
      verifySignupOtp,
      resendSignupOtp,
      requestPasswordReset,
      updatePassword,
      signOut,
    };
  }, [
    isAuthLoading,
    resendSignupOtp,
    requestPasswordReset,
    session,
    signInWithPassword,
    signOut,
    signUpWithPassword,
    updatePassword,
    user,
    verifySignupOtp,
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
