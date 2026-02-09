import { type ReactNode, useMemo, useState } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { spacingTokens } from "@/design/tokens/spacing";

type ScreenContainerProps = {
  children: ReactNode;
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewStyle?: StyleProp<ViewStyle>;
  withBackground?: boolean;
};

export function ScreenContainer({
  children,
  footer,
  contentContainerStyle,
  scrollViewStyle,
  withBackground: _withBackground = true,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  const availableHeight = useMemo(() => {
    if (viewportHeight <= 0) {
      return 0;
    }
    if (!footer) {
      return viewportHeight;
    }
    return Math.max(viewportHeight - footerHeight, 0);
  }, [footer, footerHeight, viewportHeight]);

  const canScroll = useMemo(() => {
    if (availableHeight <= 0) {
      return true;
    }
    return contentHeight > availableHeight + 1;
  }, [availableHeight, contentHeight]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colorSemanticTokens.background.canvas,
      }}
    >
      <View
        style={{ flex: 1 }}
        onLayout={(event) => {
          setViewportHeight(event.nativeEvent.layout.height);
        }}
      >
        <ScrollView
          style={scrollViewStyle}
          contentInsetAdjustmentBehavior="always"
          automaticallyAdjustContentInsets
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={canScroll}
          scrollEnabled={canScroll}
          bounces={canScroll}
          alwaysBounceVertical={canScroll}
          onContentSizeChange={(_width, height) => {
            setContentHeight(height);
          }}
          contentContainerStyle={[
            {
              flexGrow: 1,
              gap: spacingTokens.sectionGap,
              paddingHorizontal: spacingTokens.screenHorizontal,
              paddingBottom: Math.max(
                insets.bottom + spacingTokens.xl,
                spacingTokens["4xl"],
              ),
              paddingTop: spacingTokens.md,
              minHeight: availableHeight > 0 ? availableHeight : undefined,
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </ScrollView>
        {footer ? (
          <View
            onLayout={(event) => {
              setFooterHeight(event.nativeEvent.layout.height);
            }}
            style={{
              borderTopWidth: 1,
              borderTopColor: colorSemanticTokens.border.subtle,
              paddingHorizontal: spacingTokens.screenHorizontal,
              paddingTop: spacingTokens.sm,
              paddingBottom: Math.max(insets.bottom, spacingTokens.sm),
              backgroundColor: colorSemanticTokens.background.chrome,
            }}
          >
            {footer}
          </View>
        ) : null}
      </View>
    </View>
  );
}
