export type ColorSemanticTokens = {
  background: {
    canvas: string;
    chrome: string;
    subtle: string;
    overlay: string;
    gradientStart: string;
    gradientEnd: string;
  };
  surface: {
    card: string;
    cardStrong: string;
    cardMuted: string;
    glass: string;
    glassStrong: string;
  };
  border: {
    subtle: string;
    muted: string;
    strong: string;
    accent: string;
    glass: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    accent: string;
  };
  accent: {
    primary: string;
    soft: string;
    softStrong: string;
    contrast: string;
  };
  state: {
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
    dangerSoft: string;
    info: string;
    infoSoft: string;
  };
  financial: {
    positive: string;
    negative: string;
    neutral: string;
  };
};

export type ResolvedTheme = "light" | "dark";

export const lightColorSemanticTokens: ColorSemanticTokens = {
  background: {
    canvas: "#F3F1F6",
    chrome: "#FFFFFF",
    subtle: "#ECE8F1",
    overlay: "rgba(0, 0, 0, 0.38)",
    gradientStart: "#F3F1F6",
    gradientEnd: "#ECE8F1",
  },
  surface: {
    card: "#FFFFFF",
    cardStrong: "#FFFFFF",
    cardMuted: "#F5F2EE",
    glass: "#FFFFFF",
    glassStrong: "#FFFFFF",
  },
  border: {
    subtle: "#E2DEE8",
    muted: "#CCC5D6",
    strong: "#A3A3A3",
    accent: "#5D18EB",
    glass: "#EDE9E3",
  },
  text: {
    primary: "#1A1A1A",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
    inverse: "#FFFFFF",
    accent: "#5D18EB",
  },
  accent: {
    primary: "#5D18EB",
    soft: "rgba(93, 24, 235, 0.10)",
    softStrong: "rgba(93, 24, 235, 0.18)",
    contrast: "#F2EBFF",
  },
  state: {
    success: "#22C55E",
    successSoft: "rgba(34, 197, 94, 0.12)",
    warning: "#E5A000",
    warningSoft: "rgba(229, 160, 0, 0.12)",
    danger: "#EF4444",
    dangerSoft: "rgba(239, 68, 68, 0.10)",
    info: "#3B82F6",
    infoSoft: "rgba(59, 130, 246, 0.12)",
  },
  financial: {
    positive: "#22C55E",
    negative: "#EF4444",
    neutral: "#1A1A1A",
  },
};

export const darkColorSemanticTokens: ColorSemanticTokens = {
  background: {
    canvas: "#000000",
    chrome: "#000000",
    subtle: "#0A0A0D",
    overlay: "rgba(0, 0, 0, 0.62)",
    gradientStart: "#000000",
    gradientEnd: "#0A0A0D",
  },
  surface: {
    card: "#0B0B0F",
    cardStrong: "#121218",
    cardMuted: "#17171C",
    glass: "#0B0B0F",
    glassStrong: "#14141A",
  },
  border: {
    subtle: "#1E1E26",
    muted: "#2A2A34",
    strong: "#3A3A48",
    accent: "#7C4DFF",
    glass: "#232330",
  },
  text: {
    primary: "#F5F5F7",
    secondary: "#B7BAC4",
    tertiary: "#8F93A1",
    inverse: "#FFFFFF",
    accent: "#B89FFF",
  },
  accent: {
    primary: "#7C4DFF",
    soft: "rgba(124, 77, 255, 0.20)",
    softStrong: "rgba(124, 77, 255, 0.32)",
    contrast: "#E8E0FF",
  },
  state: {
    success: "#34D399",
    successSoft: "rgba(52, 211, 153, 0.20)",
    warning: "#FBBF24",
    warningSoft: "rgba(251, 191, 36, 0.20)",
    danger: "#F87171",
    dangerSoft: "rgba(248, 113, 113, 0.20)",
    info: "#60A5FA",
    infoSoft: "rgba(96, 165, 250, 0.20)",
  },
  financial: {
    positive: "#34D399",
    negative: "#F87171",
    neutral: "#F5F5F7",
  },
};

export function getColorSemanticTokens(theme: ResolvedTheme): ColorSemanticTokens {
  return theme === "dark" ? darkColorSemanticTokens : lightColorSemanticTokens;
}

const activeTokensState: { current: ColorSemanticTokens } = {
  current: lightColorSemanticTokens,
};

export function setActiveColorSemanticTokens(theme: ResolvedTheme) {
  activeTokensState.current = getColorSemanticTokens(theme);
}

export function getActiveColorSemanticTokens(): ColorSemanticTokens {
  return activeTokensState.current;
}

export const colorSemanticTokens: ColorSemanticTokens = new Proxy(
  {} as ColorSemanticTokens,
  {
    get(_target, key: keyof ColorSemanticTokens) {
      return activeTokensState.current[key];
    },
  },
) as ColorSemanticTokens;

export type FinancialPolarity = "positive" | "negative" | "neutral";
