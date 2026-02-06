import { useState } from "react";
import type { TextInputProps } from "react-native";
import { Text, TextInput, View } from "react-native";

import { premiumAuthUiTokens } from "@/design/tokens/auth-ui";

type AuthTextFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export function AuthTextField({
  label,
  error,
  onBlur,
  onFocus,
  ...props
}: AuthTextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus: NonNullable<TextInputProps["onFocus"]> = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps["onBlur"]> = (event) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={{ gap: premiumAuthUiTokens.spacing.xs }}>
      <Text
        selectable
        style={[
          premiumAuthUiTokens.typography.label,
          {
            color: premiumAuthUiTokens.color.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 0.22,
          },
        ]}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={premiumAuthUiTokens.color.textSubtle}
        selectionColor={premiumAuthUiTokens.color.accent}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          borderRadius: premiumAuthUiTokens.radius.control,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: error
            ? "rgba(197, 57, 57, 0.45)"
            : isFocused
              ? premiumAuthUiTokens.color.fieldBorderFocus
              : premiumAuthUiTokens.color.border,
          backgroundColor: premiumAuthUiTokens.color.field,
          paddingHorizontal: premiumAuthUiTokens.spacing.md,
          paddingVertical: 12,
          color: premiumAuthUiTokens.color.textPrimary,
          ...premiumAuthUiTokens.typography.body,
        }}
        {...props}
      />
      {error ? (
        <Text
          selectable
          style={[
            premiumAuthUiTokens.typography.caption,
            { color: premiumAuthUiTokens.color.error },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
