import type { TextStyle } from "react-native";

export const fontFamilyTokens = {
  regular: "Sora_400Regular",
  medium: "Sora_500Medium",
  semibold: "Sora_600SemiBold",
  bold: "Sora_700Bold",
} as const;

type TypographyVariant = Pick<
  TextStyle,
  "fontFamily" | "fontSize" | "lineHeight" | "letterSpacing" | "fontWeight"
>;

export const typographyTokens: Record<
  "display" | "title" | "body" | "label" | "caption",
  TypographyVariant
> = {
  display: {
    fontFamily: fontFamilyTokens.bold,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.6,
  },
  title: {
    fontFamily: fontFamilyTokens.semibold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: fontFamilyTokens.regular,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    letterSpacing: -0.1,
  },
  label: {
    fontFamily: fontFamilyTokens.medium,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    letterSpacing: 0,
  },
  caption: {
    fontFamily: fontFamilyTokens.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    letterSpacing: 0,
  },
};
