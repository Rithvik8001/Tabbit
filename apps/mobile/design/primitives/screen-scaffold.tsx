import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientOrbBackground } from "@/design/primitives/gradient-orb-background";
import { colorTokens } from "@/design/tokens/color";
import { spacingTokens } from "@/design/tokens/spacing";

type ScreenScaffoldProps = {
  children: ReactNode;
  footer?: ReactNode;
  withOrbBackground?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function ScreenScaffold({
  children,
  footer,
  withOrbBackground = true,
  contentContainerStyle,
}: ScreenScaffoldProps) {
  const insets = useSafeAreaInsets();

  const body = (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          {
            flexGrow: 1,
            gap: spacingTokens.xl,
            paddingTop: spacingTokens.lg,
            paddingHorizontal: spacingTokens.screenHorizontal,
            paddingBottom: footer ? 140 : Math.max(insets.bottom + 24, 32),
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
      {footer ? (
        <View
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            left: 0,
            paddingHorizontal: spacingTokens.screenHorizontal,
            paddingTop: spacingTokens.md,
            paddingBottom: Math.max(insets.bottom, spacingTokens.lg),
            borderTopWidth: 1,
            borderTopColor: colorTokens.border.subtle,
            backgroundColor: "rgba(245, 246, 248, 0.94)",
          }}
        >
          {footer}
        </View>
      ) : null}
    </>
  );

  if (withOrbBackground) {
    return <GradientOrbBackground>{body}</GradientOrbBackground>;
  }

  return <View style={{ flex: 1, backgroundColor: colorTokens.surface.base }}>{body}</View>;
}
