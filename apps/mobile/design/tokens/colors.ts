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

export const colorSemanticTokens: ColorSemanticTokens = {
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

export type FinancialPolarity = "positive" | "negative" | "neutral";
