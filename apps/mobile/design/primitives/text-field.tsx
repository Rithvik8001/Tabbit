import { useState } from "react";
import type { TextInputProps } from "@/design/primitives/sora-native";
import { Text, TextInput, View } from "@/design/primitives/sora-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
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
          { color: colorSemanticTokens.text.primary, fontWeight: "500" },
        ]}
      >
        {resolvedLabel}
      </Text>
      <TextInput
        selectionColor={colorSemanticTokens.accent.primary}
        placeholderTextColor={colorSemanticTokens.text.tertiary}
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
              ? colorSemanticTokens.state.danger
              : isFocused
                ? colorSemanticTokens.accent.primary
                : "transparent",
            backgroundColor: colorSemanticTokens.background.subtle,
            color: colorSemanticTokens.text.primary,
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
            { color: colorSemanticTokens.state.danger },
          ]}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          selectable
          style={[
            typographyScale.bodySm,
            { color: colorSemanticTokens.text.tertiary },
          ]}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
