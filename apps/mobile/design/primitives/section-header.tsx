import type { ReactNode } from "react";
import { Text, View } from "@/design/primitives/sora-native";

import { useThemeColors } from "@/providers/theme-provider";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function SectionHeader({
  title,
  subtitle,
  trailing,
}: SectionHeaderProps) {
  const colors = useThemeColors();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View style={{ flex: 1, gap: spacingTokens.xxs }}>
        <Text
          selectable
          style={[
            typographyScale.headingLg,
            { color: colors.text.primary },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            selectable
            style={[
              typographyScale.bodySm,
              { color: colors.text.tertiary },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}
