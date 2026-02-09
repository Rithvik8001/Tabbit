import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colorSemanticTokens } from "@/design/tokens/colors";

type AuthScreenShellProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreenShell({
  title,
  children,
  footer,
}: AuthScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colorSemanticTokens.background.canvas }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: insets.top + 56,
            paddingBottom: insets.bottom + 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "600",
              color: colorSemanticTokens.text.primary,
              textAlign: "center",
              marginBottom: 40,
            }}
          >
            {title}
          </Text>

          <View style={{ gap: 20 }}>{children}</View>

          {footer ? (
            <View style={{ marginTop: 24 }}>{footer}</View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
