import { Image } from "expo-image";

import { Button } from "@/design/primitives/button";
import { Text, View } from "@/design/primitives/sora-native";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import type { PreparedExpenseReceiptUpload } from "@/features/groups/types/expense-receipt.types";

type ExpenseReceiptCardProps = {
  preparedReceipt: PreparedExpenseReceiptUpload | null;
  hasAttachedReceipt?: boolean;
  isBusy?: boolean;
  error?: string | null;
  onPick: () => void;
  onClearPrepared: () => void;
  onPreviewAttached?: () => void;
  onClearAttached?: () => void;
};

function formatBytes(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} MB`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)} KB`;
  }
  return `${value} B`;
}

export function ExpenseReceiptCard({
  preparedReceipt,
  hasAttachedReceipt = false,
  isBusy = false,
  error,
  onPick,
  onClearPrepared,
  onPreviewAttached,
  onClearAttached,
}: ExpenseReceiptCardProps) {
  return (
    <View
      style={{
        borderRadius: radiusTokens.card,
        borderCurve: "continuous",
        backgroundColor: colorSemanticTokens.surface.card,
        padding: spacingTokens.md,
        gap: spacingTokens.sm,
      }}
    >
      <Text
        selectable
        style={[typographyScale.headingMd, { color: colorSemanticTokens.text.primary }]}
      >
        Receipt (optional)
      </Text>
      <Text
        selectable
        style={[typographyScale.bodySm, { color: colorSemanticTokens.text.secondary }]}
      >
        Add one bill image. Supported formats: JPG, PNG, WebP, HEIC.
      </Text>

      {preparedReceipt ? (
        <>
          <View
            style={{
              borderRadius: radiusTokens.control,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colorSemanticTokens.border.subtle,
              backgroundColor: colorSemanticTokens.background.subtle,
              padding: spacingTokens.sm,
              flexDirection: "row",
              alignItems: "center",
              gap: spacingTokens.sm,
            }}
          >
            <Image
              source={{ uri: preparedReceipt.localUri }}
              contentFit="cover"
              style={{
                width: 72,
                height: 72,
                borderRadius: radiusTokens.control,
              }}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                selectable
                style={[
                  typographyScale.headingSm,
                  { color: colorSemanticTokens.text.primary },
                ]}
              >
                Ready to upload
              </Text>
              <Text
                selectable
                style={[
                  typographyScale.bodySm,
                  { color: colorSemanticTokens.text.secondary },
                ]}
              >
                {formatBytes(preparedReceipt.sizeBytes)} · {preparedReceipt.width}x
                {preparedReceipt.height}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: spacingTokens.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Replace"
                variant="soft"
                onPress={onPick}
                disabled={isBusy}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Remove"
                variant="soft"
                tone="danger"
                onPress={onClearPrepared}
                disabled={isBusy}
              />
            </View>
          </View>
        </>
      ) : null}

      {!preparedReceipt && hasAttachedReceipt ? (
        <>
          <View
            style={{
              borderRadius: radiusTokens.control,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colorSemanticTokens.border.subtle,
              backgroundColor: colorSemanticTokens.background.subtle,
              padding: spacingTokens.sm,
              gap: 4,
            }}
          >
            <Text
              selectable
              style={[
                typographyScale.headingSm,
                { color: colorSemanticTokens.text.primary },
              ]}
            >
              Receipt attached
            </Text>
            <Text
              selectable
              style={[
                typographyScale.bodySm,
                { color: colorSemanticTokens.text.secondary },
              ]}
            >
              You can preview, replace, or remove it.
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: spacingTokens.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Preview"
                variant="soft"
                onPress={onPreviewAttached}
                disabled={!onPreviewAttached || isBusy}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Replace"
                variant="soft"
                onPress={onPick}
                disabled={isBusy}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Remove"
                variant="soft"
                tone="danger"
                onPress={onClearAttached}
                disabled={!onClearAttached || isBusy}
              />
            </View>
          </View>
        </>
      ) : null}

      {!preparedReceipt && !hasAttachedReceipt ? (
        <Button
          label="Add receipt"
          variant="soft"
          onPress={onPick}
          disabled={isBusy}
        />
      ) : null}

      {error ? (
        <Text
          selectable
          style={[typographyScale.bodySm, { color: colorSemanticTokens.state.danger }]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
