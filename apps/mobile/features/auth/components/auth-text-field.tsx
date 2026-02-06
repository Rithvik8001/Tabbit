import type { TextInputProps } from "react-native";
import { Text, TextInput, View } from "react-native";

import { colorTokens } from "@/design/tokens/color";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyTokens } from "@/design/tokens/typography";

type AuthTextFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export function AuthTextField({ label, error, ...props }: AuthTextFieldProps) {
  return (
    <View style={{ gap: spacingTokens.xs }}>
      <Text
        selectable
        style={[typographyTokens.label, { color: colorTokens.text.secondary }]}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colorTokens.text.muted}
        selectionColor={colorTokens.brand.primary}
        style={{
          borderRadius: radiusTokens.button,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: error
            ? "rgba(197, 57, 57, 0.45)"
            : colorTokens.border.subtle,
          backgroundColor: "rgba(255, 255, 255, 0.86)",
          paddingHorizontal: spacingTokens.lg,
          paddingVertical: spacingTokens.md,
          color: colorTokens.text.primary,
          ...typographyTokens.body,
        }}
        {...props}
      />
      {error ? (
        <Text
          selectable
          style={[typographyTokens.caption, { color: "rgb(176, 48, 48)" }]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
