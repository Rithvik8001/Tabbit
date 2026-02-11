import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SystemUI from "expo-system-ui";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, useColorScheme } from "react-native";

import {
  type ColorSemanticTokens,
  type ResolvedTheme,
  getColorSemanticTokens,
  setActiveColorSemanticTokens,
} from "@/design/tokens/colors";

export type ThemePreference = "system" | "light" | "dark";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  colors: ColorSemanticTokens;
  setPreference: (nextPreference: ThemePreference) => void;
  isHydrated: boolean;
};

const THEME_PREFERENCE_KEY = "tabbit.appearance_preference.v1";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(
  preference: ThemePreference,
  systemColorScheme: ReturnType<typeof useColorScheme>,
): ResolvedTheme {
  if (preference === "light" || preference === "dark") {
    return preference;
  }

  return systemColorScheme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydratePreference = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (!isMounted) {
          return;
        }

        if (storedValue === "light" || storedValue === "dark" || storedValue === "system") {
          setPreferenceState(storedValue);
        } else {
          setPreferenceState("system");
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void hydratePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      Appearance.setColorScheme(preference === "system" ? null : preference);
    } catch {
      // no-op; best effort only
    }
  }, [preference]);

  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    return resolveTheme(preference, systemColorScheme);
  }, [preference, systemColorScheme]);

  const colors = useMemo(() => {
    return getColorSemanticTokens(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    setActiveColorSemanticTokens(resolvedTheme);

    void SystemUI.setBackgroundColorAsync(colors.background.canvas).catch(() => {
      // no-op; best effort only
    });
  }, [colors.background.canvas, resolvedTheme]);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    void AsyncStorage.setItem(THEME_PREFERENCE_KEY, nextPreference).catch(() => {
      // no-op; preference still applies in-memory for this session
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      preference,
      resolvedTheme,
      colors,
      setPreference,
      isHydrated,
    };
  }, [colors, isHydrated, preference, resolvedTheme, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}

export function useThemeColors(): ColorSemanticTokens {
  return useTheme().colors;
}
