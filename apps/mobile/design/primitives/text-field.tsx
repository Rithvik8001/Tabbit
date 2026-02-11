import { useState } from "react";
import type { TextInputProps } from "@/design/primitives/sora-native";
import { Text, TextInput, View } from "@/design/primitives/sora-native";

import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";

type TextFieldProps = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string | null;
  helperText?: string;
};

export function TextField({
  label,
  required = false,
  error,
  helperText,
  onBlur,
  onFocus,
  ...props
}: TextFieldProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const resolvedLabel = required && !label.includes("*") ? `${label} *` : label;

  const handleFocus: NonNullable<TextInputProps["onFocus"]> = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps["onBlur"]> = (event) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={{ gap: spacingTokens.xs }}>
      <Text
        selectable
        style={[
          typographyScale.labelSm,
          { color: colors.text.primary, fontWeight: "500" },
        ]}
      >
        {resolvedLabel}
      </Text>
      <TextInput
        selectionColor={colors.accent.primary}
        placeholderTextColor={colors.text.tertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          typographyScale.bodyMd,
          {
            minHeight: 48,
            borderRadius: radiusTokens.control,
            borderCurve: "continuous",
            borderWidth: 1.5,
            borderColor: error
              ? colors.state.danger
              : isFocused
                ? colors.accent.primary
                : "transparent",
            backgroundColor: colors.background.subtle,
            color: colors.text.primary,
            paddingHorizontal: spacingTokens.md,
            paddingVertical: 12,
          },
        ]}
        {...props}
      />
      {error ? (
        <Text
          selectable
          style={[
            typographyScale.bodySm,
            { color: colors.state.danger },
          ]}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          selectable
          style={[
            typographyScale.bodySm,
            { color: colors.text.tertiary },
          ]}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
