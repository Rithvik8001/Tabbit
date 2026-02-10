import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";

import { Button } from "@/design/primitives/button";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "@/design/primitives/sora-native";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import {
  createExpenseReceiptSignedUrl,
  getExpenseById,
} from "@/features/groups/lib/expenses-repository";

export default function ReceiptPreviewScreen() {
  const router = useRouter();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();

  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPreview = () => {
    if (!expenseId) {
      setError("Missing expense id.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSignedUrl(null);

    void (async () => {
      const expenseResult = await getExpenseById(expenseId);
      if (!expenseResult.ok) {
        setError(expenseResult.message);
        setIsLoading(false);
        return;
      }

      const expense = expenseResult.data;
      if (!expense.receiptBucket || !expense.receiptObjectPath) {
        setError("No receipt is attached to this expense.");
        setIsLoading(false);
        return;
      }

      const signedUrlResult = await createExpenseReceiptSignedUrl(
        expense.receiptBucket,
        expense.receiptObjectPath,
        120,
      );
      if (!signedUrlResult.ok) {
        setError(signedUrlResult.message);
        setIsLoading(false);
        return;
      }

      setSignedUrl(signedUrlResult.data);
      setIsLoading(false);
    })();
  };

  useEffect(() => {
    loadPreview();
    // expenseId change should reload preview.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseId]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: spacingTokens.xl,
        paddingTop: spacingTokens.sm,
        paddingBottom: spacingTokens["3xl"],
        gap: spacingTokens.md,
      }}
    >
      <View
        style={{
          minHeight: 40,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Text
            selectable
            style={[
              typographyScale.headingSm,
              { color: colorSemanticTokens.text.secondary },
            ]}
          >
            Close
          </Text>
        </Pressable>
      </View>

      <Text
        selectable
        style={[
          typographyScale.headingLg,
          { color: colorSemanticTokens.text.primary },
        ]}
      >
        Receipt
      </Text>

      {isLoading ? (
        <View style={{ alignItems: "center", paddingVertical: spacingTokens.xxl }}>
          <ActivityIndicator
            size="large"
            color={colorSemanticTokens.accent.primary}
          />
        </View>
      ) : null}

      {error ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colorSemanticTokens.state.danger,
            backgroundColor: colorSemanticTokens.state.dangerSoft,
            padding: spacingTokens.md,
            gap: spacingTokens.sm,
          }}
        >
          <Text
            selectable
            style={[
              typographyScale.headingSm,
              { color: colorSemanticTokens.state.danger },
            ]}
          >
            {error}
          </Text>
          <Button label="Retry" variant="soft" onPress={loadPreview} />
        </View>
      ) : null}

      {signedUrl ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colorSemanticTokens.border.subtle,
            backgroundColor: colorSemanticTokens.surface.card,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: signedUrl }}
            contentFit="contain"
            style={{
              width: "100%",
              height: 520,
              backgroundColor: colorSemanticTokens.background.subtle,
            }}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}
