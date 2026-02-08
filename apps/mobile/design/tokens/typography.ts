import type { TextStyle } from "react-native";

export const fontFamilyTokens = {
  bodyRegular: undefined,
  bodyMedium: undefined,
  bodySemiBold: undefined,
  bodyBold: undefined,
  displayRegular: undefined,
  displayMedium: undefined,
  displaySemiBold: undefined,
  displayBold: undefined,
  regular: undefined,
  medium: undefined,
  semibold: undefined,
  bold: undefined,
} as const;

type TypographyVariant = Pick<
  TextStyle,
  "fontSize" | "lineHeight" | "letterSpacing" | "fontWeight"
>;

export type TypographyTokens = Record<
  | "displayXl"
  | "displayLg"
  | "displayMd"
  | "headingLg"
  | "headingMd"
  | "headingSm"
  | "bodyLg"
  | "bodyMd"
  | "bodySm"
  | "labelLg"
  | "labelMd"
  | "labelSm"
  | "caption",
  TypographyVariant
>;

export const typographyScale: TypographyTokens = {
  displayXl: {
    fontSize: 42,
    lineHeight: 52,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  displayLg: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  displayMd: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  headingLg: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: 0,
  },
  headingMd: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    letterSpacing: 0,
  },
  headingSm: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    letterSpacing: 0,
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: "400",
    letterSpacing: 0,
  },
  bodyMd: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400",
    letterSpacing: 0,
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "400",
    letterSpacing: 0,
  },
  labelLg: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  labelMd: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
};

export const typographyTokens: Record<
  "display" | "title" | "body" | "label" | "caption",
  TypographyVariant
> = {
  display: {
    ...typographyScale.displayLg,
  },
  title: {
    ...typographyScale.headingLg,
  },
  body: {
    ...typographyScale.bodyLg,
  },
  label: {
    ...typographyScale.labelMd,
  },
  caption: {
    ...typographyScale.caption,
  },
};
