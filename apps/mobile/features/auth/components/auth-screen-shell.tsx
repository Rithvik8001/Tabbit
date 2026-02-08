import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
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
          {/* Title */}
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: "#AFAFAF",
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            {title}
          </Text>

          {/* Content */}
          <View style={{ gap: 20 }}>{children}</View>

          {/* Footer */}
          {footer ? (
            <View style={{ marginTop: 24 }}>{footer}</View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
