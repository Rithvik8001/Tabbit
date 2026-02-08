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
    canvas: "#EEF2F7",
    chrome: "rgba(246, 248, 252, 0.92)",
    subtle: "#F6F8FB",
    overlay: "rgba(11, 17, 32, 0.38)",
    gradientStart: "#F5F8FF",
    gradientEnd: "#EDF2F8",
  },
  surface: {
    card: "rgba(255, 255, 255, 0.74)",
    cardStrong: "rgba(255, 255, 255, 0.90)",
    cardMuted: "rgba(248, 250, 253, 0.72)",
    glass: "rgba(255, 255, 255, 0.62)",
    glassStrong: "rgba(255, 255, 255, 0.84)",
  },
  border: {
    subtle: "rgba(9, 14, 26, 0.10)",
    muted: "rgba(9, 14, 26, 0.14)",
    strong: "rgba(9, 14, 26, 0.22)",
    accent: "rgba(59, 96, 255, 0.42)",
    glass: "rgba(255, 255, 255, 0.80)",
  },
  text: {
    primary: "#0B1120",
    secondary: "#344256",
    tertiary: "#647287",
    inverse: "#FFFFFF",
    accent: "#3052D6",
  },
  accent: {
    primary: "#3257E2",
    soft: "rgba(50, 87, 226, 0.10)",
    softStrong: "rgba(50, 87, 226, 0.18)",
    contrast: "#F4F7FF",
  },
  state: {
    success: "#1A8F4F",
    successSoft: "rgba(26, 143, 79, 0.12)",
    warning: "#A66710",
    warningSoft: "rgba(166, 103, 16, 0.12)",
    danger: "#BC2B3E",
    dangerSoft: "rgba(188, 43, 62, 0.12)",
    info: "#3052D6",
    infoSoft: "rgba(48, 82, 214, 0.11)",
  },
  financial: {
    positive: "#17834A",
    negative: "#B7363D",
    neutral: "#0B1120",
  },
};

export type FinancialPolarity = "positive" | "negative" | "neutral";
