import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  TextInput,
  View,
} from "@/design/primitives/sora-native";

import { BalanceListRow } from "@/design/primitives/balance-list-row";
import { Button } from "@/design/primitives/button";
import { FloatingAddExpenseCta } from "@/design/primitives/floating-add-expense-cta";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { TabTopActions } from "@/design/primitives/tab-top-actions";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useActivityFeed } from "@/features/activity/hooks/use-activity-feed";

export default function ActivityTabScreen() {
  const router = useRouter();
  const { rows, isLoading, error, refresh, canLoadMore, loadMore } =
    useActivityFeed();
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return rows;
    }

    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(normalized) ||
        row.subtitle.toLowerCase().includes(normalized),
    );
  }, [query, rows]);

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer
        contentContainerStyle={{
          gap: spacingTokens.md,
          paddingBottom: spacingTokens["6xl"] + 120,
        }}
      >
        <TabTopActions
          onSearchPress={() => setShowSearch((current) => !current)}
        />

        {showSearch ? (
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search activity"
            placeholderTextColor={colorSemanticTokens.text.tertiary}
            selectionColor={colorSemanticTokens.accent.primary}
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              typographyScale.bodyLg,
              {
                borderRadius: radiusTokens.control,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: colorSemanticTokens.border.subtle,
                backgroundColor: colorSemanticTokens.surface.card,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: colorSemanticTokens.text.primary,
              },
            ]}
          />
        ) : null}

        {error ? (
          <Button label="Retry" variant="soft" onPress={() => void refresh()} />
        ) : null}

        {isLoading ? (
          <View
            style={{ alignItems: "center", paddingVertical: spacingTokens.md }}
          >
            <ActivityIndicator
              size="small"
              color={colorSemanticTokens.accent.primary}
            />
          </View>
        ) : null}

        {!isLoading && filteredRows.length === 0 ? (
          <View
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colorSemanticTokens.border.subtle,
              backgroundColor: colorSemanticTokens.surface.card,
              padding: spacingTokens.cardPadding,
              gap: spacingTokens.sm,
            }}
          >
            <BalanceListRow
              title="No activity yet"
              subtitle="Add an expense to start your timeline."
              statusLabel=""
              tone="neutral"
            />
          </View>
        ) : null}

        {filteredRows.map((row) => (
          <View
            key={row.id}
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colorSemanticTokens.border.subtle,
              backgroundColor: colorSemanticTokens.surface.card,
            }}
          >
            <BalanceListRow
              title={row.title}
              subtitle={`${row.subtitle} · ${row.timestampLabel}`}
              statusLabel={row.impactLabel}
              amountText={row.impactAmount}
              tone={row.tone}
              onPress={() => {
                router.push({
                  pathname: "/(app)/(tabs)/(groups)/[id]",
                  params: { id: row.groupId },
                });
              }}
            />
          </View>
        ))}

        {canLoadMore ? (
          <Button label="View all activity" variant="soft" onPress={loadMore} />
        ) : null}
      </ScreenContainer>

      <FloatingAddExpenseCta
        onPress={() => {
          router.push("/(app)/add-expense-context");
        }}
      />
    </View>
  );
}
