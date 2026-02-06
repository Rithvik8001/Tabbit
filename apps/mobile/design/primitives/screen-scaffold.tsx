import { type ReactNode, useMemo, useState } from "react";
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
  footerStyle?: StyleProp<ViewStyle>;
  footerMode?: "overlay" | "docked";
  preferViewportFit?: boolean;
};

export function ScreenScaffold({
  children,
  footer,
  withOrbBackground = true,
  contentContainerStyle,
  footerStyle,
  footerMode = "overlay",
  preferViewportFit = false,
}: ScreenScaffoldProps) {
  const insets = useSafeAreaInsets();
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  const availableHeightForContent = useMemo(() => {
    if (footerMode !== "docked") {
      return containerHeight;
    }
    return Math.max(containerHeight - footerHeight, 0);
  }, [containerHeight, footerHeight, footerMode]);

  const shouldAllowScroll = useMemo(() => {
    if (!preferViewportFit) {
      return true;
    }
    if (availableHeightForContent <= 0) {
      return true;
    }
    return contentHeight > availableHeightForContent + 1;
  }, [availableHeightForContent, contentHeight, preferViewportFit]);

  const footerContainerStyle: StyleProp<ViewStyle> = [
    {
      paddingHorizontal: spacingTokens.screenHorizontal,
      paddingTop: spacingTokens.md,
      paddingBottom: Math.max(insets.bottom, spacingTokens.lg),
      borderTopWidth: 1,
      borderTopColor: colorTokens.border.subtle,
      backgroundColor: "rgba(245, 246, 248, 0.94)",
    },
    footerStyle,
  ];

  const body = (
    <View
      style={{ flex: 1 }}
      onLayout={(event) => {
        setContainerHeight(event.nativeEvent.layout.height);
      }}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={shouldAllowScroll}
        scrollEnabled={shouldAllowScroll}
        onContentSizeChange={(_width, height) => {
          setContentHeight(height);
        }}
        contentContainerStyle={[
          {
            flexGrow: 1,
            gap: spacingTokens.xl,
            paddingTop: spacingTokens.lg,
            paddingHorizontal: spacingTokens.screenHorizontal,
            paddingBottom:
              footer && footerMode === "overlay"
                ? 140
                : footer && footerMode === "docked"
                  ? spacingTokens.lg
                  : Math.max(insets.bottom + 24, 32),
            minHeight:
              preferViewportFit && availableHeightForContent > 0
                ? availableHeightForContent
                : undefined,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
      {footer && footerMode === "overlay" ? (
        <View
          onLayout={(event) => {
            setFooterHeight(event.nativeEvent.layout.height);
          }}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            left: 0,
          }}
        >
          <View style={footerContainerStyle}>{footer}</View>
        </View>
      ) : null}
      {footer && footerMode === "docked" ? (
        <View
          onLayout={(event) => {
            setFooterHeight(event.nativeEvent.layout.height);
          }}
          style={footerContainerStyle}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );

  if (withOrbBackground) {
    return <GradientOrbBackground>{body}</GradientOrbBackground>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colorTokens.surface.base }}>
      {body}
    </View>
  );
}
