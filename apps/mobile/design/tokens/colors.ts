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
    canvas: "#FFFFFF",
    chrome: "#FFFFFF",
    subtle: "#F7F7F7",
    overlay: "rgba(0, 0, 0, 0.38)",
    gradientStart: "#FFFFFF",
    gradientEnd: "#F7F7F7",
  },
  surface: {
    card: "#FFFFFF",
    cardStrong: "#FFFFFF",
    cardMuted: "#F7F7F7",
    glass: "#FFFFFF",
    glassStrong: "#FFFFFF",
  },
  border: {
    subtle: "#E5E5E5",
    muted: "#D4D4D4",
    strong: "#A3A3A3",
    accent: "#58CC02",
    glass: "#E5E5E5",
  },
  text: {
    primary: "#3C3C3C",
    secondary: "#777777",
    tertiary: "#AFAFAF",
    inverse: "#FFFFFF",
    accent: "#58CC02",
  },
  accent: {
    primary: "#58CC02",
    soft: "rgba(88, 204, 2, 0.12)",
    softStrong: "rgba(88, 204, 2, 0.22)",
    contrast: "#F0FFF0",
  },
  state: {
    success: "#58CC02",
    successSoft: "rgba(88, 204, 2, 0.12)",
    warning: "#E5A000",
    warningSoft: "rgba(229, 160, 0, 0.12)",
    danger: "#FF4B4B",
    dangerSoft: "rgba(255, 75, 75, 0.12)",
    info: "#1CB0F6",
    infoSoft: "rgba(28, 176, 246, 0.12)",
  },
  financial: {
    positive: "#58CC02",
    negative: "#FF4B4B",
    neutral: "#3C3C3C",
  },
};

export type FinancialPolarity = "positive" | "negative" | "neutral";
