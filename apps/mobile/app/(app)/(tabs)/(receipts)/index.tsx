import { Text, View } from "react-native";

import { Badge } from "@/design/primitives/badge";
import { LiquidSurface } from "@/design/primitives/liquid-surface";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import {
  formatCurrency,
  formatShortDate,
  receiptItems,
  type ReceiptStatus,
} from "@/features/app-shell/mock/tab-mock-data";

function statusLabel(status: ReceiptStatus): string {
  if (status === "needs_review") {
    return "Needs Review";
  }
  if (status === "processed") {
    return "Processed";
  }
  return "Scanned";
}

function statusTone(status: ReceiptStatus): "success" | "accent" | "neutral" {
  if (status === "needs_review") {
    return "neutral";
  }
  if (status === "processed") {
    return "accent";
  }
  return "success";
}

export default function ReceiptsTabScreen() {
  return (
    <ScreenContainer contentContainerStyle={{ gap: spacingTokens.sm }}>
      {receiptItems.map((receipt) => (
        <LiquidSurface
          key={receipt.id}
          contentStyle={{
            padding: spacingTokens.cardPadding,
            gap: spacingTokens.sm,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: spacingTokens.sm,
            }}
          >
            <Text
              selectable
              style={[
                typographyScale.headingMd,
                { flex: 1, color: colorSemanticTokens.text.primary },
              ]}
            >
              {receipt.merchant}
            </Text>
            <Text
              selectable
              style={[
                typographyScale.headingMd,
                {
                  color: colorSemanticTokens.text.primary,
                  fontVariant: ["tabular-nums"],
                },
              ]}
            >
              {formatCurrency(receipt.amount)}
            </Text>
          </View>

          <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.text.secondary }]}>
            {receipt.groupName} · Added by {receipt.submittedBy} · {formatShortDate(receipt.scannedAt)}
          </Text>

          <Badge label={statusLabel(receipt.status)} tone={statusTone(receipt.status)} />
        </LiquidSurface>
      ))}
    </ScreenContainer>
  );
}
