import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "@/design/primitives/sora-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useAuth } from "@/features/auth/state/auth-provider";
import { formatCents } from "@/features/groups/lib/format-currency";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";
import { useGroupExpenses } from "@/features/groups/hooks/use-group-expenses";

function monthLabel(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function shortDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(parsed);
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { group, members, isLoading, error, refresh } = useGroupDetail(id);
  const { expenses, userBalance, simplifiedDebts, deleteExpense } =
    useGroupExpenses(id, members);

  const groupedExpenses = useMemo(() => {
    const map = new Map<string, typeof expenses>();

    for (const expense of expenses) {
      const key = monthLabel(expense.expenseDate);
      const current = map.get(key);
      if (current) {
        current.push(expense);
      } else {
        map.set(key, [expense]);
      }
    }

    return Array.from(map.entries()).map(([label, items]) => ({
      label,
      items,
    }));
  }, [expenses]);

  const debtsInvolvingCurrentUser = useMemo(() => {
    return simplifiedDebts.filter(
      (debt) => debt.fromUserId === user?.id || debt.toUserId === user?.id,
    );
  }, [simplifiedDebts, user?.id]);

  const handleDeleteExpense = (expenseId: string, description: string) => {
    Alert.alert("Delete Expense", `Delete \"${description}\"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void (async () => {
            const result = await deleteExpense(expenseId);
            if (!result.ok) {
              Alert.alert("Error", result.message);
            }
          })();
        },
      },
    ]);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: spacingTokens.xl,
        paddingTop: spacingTokens.sm,
        paddingBottom: spacingTokens["4xl"],
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
            Back
          </Text>
        </Pressable>

        {group ? (
          <Pressable
            onPress={() => {
              router.push({
                pathname: "/(app)/(tabs)/(groups)/settings",
                params: { id: group.id },
              });
            }}
          >
            <Text
              selectable
              style={[
                typographyScale.headingSm,
                { color: colorSemanticTokens.accent.primary },
              ]}
            >
              Settings
            </Text>
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <Text
          selectable
          style={[
            typographyScale.bodyMd,
            { color: colorSemanticTokens.text.secondary },
          ]}
        >
          Loading group...
        </Text>
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
          <Pressable onPress={() => void refresh()}>
            
            <Text
              selectable
              style={[
                typographyScale.headingSm,
                { color: colorSemanticTokens.accent.primary },
              ]}
            >
              
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!isLoading && !error && group ? (
        <>
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
            <Text selectable style={{ fontSize: 48, lineHeight: 54 }}>
              
              {group.emoji}
            </Text>
            <Text
              selectable
              style={[
                typographyScale.displayMd,
                { color: colorSemanticTokens.text.primary },
              ]}
            >
              {group.name}
            </Text>
            <Text
              selectable
              style={[
                typographyScale.bodyMd,
                { color: colorSemanticTokens.text.secondary },
              ]}
            >
              {members.length} {members.length === 1 ? "member" : "members"}
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacingTokens.sm,
              }}
            >
              
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: "/(app)/(tabs)/(groups)/add-expense",
                    params: { id: group.id },
                  });
                }}
                style={{
                  borderRadius: radiusTokens.pill,
                  borderCurve: "continuous",
                  backgroundColor: colorSemanticTokens.accent.primary,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
              >
                <Text
                  selectable
                  style={[
                    typographyScale.headingSm,
                    { color: colorSemanticTokens.text.inverse },
                  ]}
                >
                  
                  Add expense
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: "/(app)/(tabs)/(groups)/settings",
                    params: { id: group.id },
                  });
                }}
                style={{
                  borderRadius: radiusTokens.pill,
                  borderCurve: "continuous",
                  backgroundColor: colorSemanticTokens.background.subtle,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
              >
                <Text
                  selectable
                  style={[
                    typographyScale.headingSm,
                    { color: colorSemanticTokens.text.primary },
                  ]}
                >
                  
                  Group settings
                </Text>
              </Pressable>
            </View>
          </View>

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
            <Text
              selectable
              style={[
                typographyScale.headingMd,
                { color: colorSemanticTokens.text.primary },
              ]}
            >
              {userBalance.direction === "you_are_owed"
                ? "You are owed"
                : userBalance.direction === "you_owe"
                  ? "You owe"
                  : "You are settled up"}
            </Text>
            <Text
              selectable
              style={[
                typographyScale.displayMd,
                {
                  color:
                    userBalance.direction === "you_are_owed"
                      ? colorSemanticTokens.financial.positive
                      : userBalance.direction === "you_owe"
                        ? colorSemanticTokens.financial.negative
                        : colorSemanticTokens.text.secondary,
                },
              ]}
            >
              {userBalance.direction === "settled"
                ? "$0.00"
                : formatCents(Math.abs(userBalance.netCents))}
            </Text>

            {debtsInvolvingCurrentUser.map((debt) => {
              const isPayer = debt.fromUserId === user?.id;

              return (
                <View
                  key={`${debt.fromUserId}-${debt.toUserId}`}
                  style={{
                    borderRadius: radiusTokens.control,
                    borderCurve: "continuous",
                    backgroundColor: colorSemanticTokens.background.subtle,
                    paddingHorizontal: spacingTokens.sm,
                    paddingVertical: spacingTokens.xs,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacingTokens.sm,
                  }}
                >
                  <Text
                    selectable
                    style={[
                      typographyScale.bodySm,
                      { color: colorSemanticTokens.text.primary, flex: 1 },
                    ]}
                  >
                    {isPayer
                      ? `You owe ${debt.toName ?? "member"} ${formatCents(debt.amountCents)}`
                      : `${debt.fromName ?? "member"} owes you ${formatCents(debt.amountCents)}`}
                  </Text>
                  <Pressable
                    onPress={() => {
                      router.push({
                        pathname: "/(app)/(tabs)/(groups)/settle-up",
                        params: {
                          id: group.id,
                          fromUserId: debt.fromUserId,
                          toUserId: debt.toUserId,
                          maxAmountCents: String(debt.amountCents),
                        },
                      });
                    }}
                  >
                    <Text
                      selectable
                      style={[
                        typographyScale.headingSm,
                        { color: colorSemanticTokens.accent.primary },
                      ]}
                    >
                      Settle
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          {groupedExpenses.map((bucket) => (
            <View key={bucket.label} style={{ gap: spacingTokens.sm }}>
              
              <Text
                selectable
                style={[
                  typographyScale.headingMd,
                  { color: colorSemanticTokens.text.primary },
                ]}
              >
                {bucket.label}
              </Text>
              {bucket.items.map((expense) => {
                const canDelete =
                  expense.createdBy === user?.id ||
                  group.createdBy === user?.id;
                const canEdit =
                  expense.createdBy === user?.id &&
                  expense.entryType !== "settlement";

                return (
                  <View
                    key={expense.id}
                    style={{
                      borderRadius: radiusTokens.card,
                      borderCurve: "continuous",
                      borderWidth: 1,
                      borderColor: colorSemanticTokens.border.subtle,
                      backgroundColor: colorSemanticTokens.surface.card,
                      padding: spacingTokens.md,
                      gap: spacingTokens.sm,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: spacingTokens.sm,
                      }}
                    >
                      <View style={{ flex: 1, gap: 2 }}>
                        
                        <Text
                          selectable
                          style={[
                            typographyScale.headingMd,
                            { color: colorSemanticTokens.text.primary },
                          ]}
                        >
                          {expense.description}
                        </Text>
                        <Text
                          selectable
                          style={[
                            typographyScale.bodySm,
                            { color: colorSemanticTokens.text.secondary },
                          ]}
                        >
                          {`Paid by ${expense.paidByName ?? "Unknown"} · ${shortDate(expense.expenseDate)}`}
                        </Text>
                      </View>
                      <Text
                        selectable
                        style={[
                          typographyScale.headingMd,
                          { color: colorSemanticTokens.text.primary },
                        ]}
                      >
                        {formatCents(expense.amountCents)}
                      </Text>
                    </View>

                    {canEdit || canDelete ? (
                      <View
                        style={{ flexDirection: "row", gap: spacingTokens.sm }}
                      >
                        
                        {canEdit ? (
                          <Pressable
                            onPress={() => {
                              router.push({
                                pathname: "/(app)/(tabs)/(groups)/edit-expense",
                                params: { id: group.id, expenseId: expense.id },
                              });
                            }}
                          >
                            <Text
                              selectable
                              style={[
                                typographyScale.headingSm,
                                { color: colorSemanticTokens.accent.primary },
                              ]}
                            >
                              Edit
                            </Text>
                          </Pressable>
                        ) : null}
                        {canDelete ? (
                          <Pressable
                            onPress={() =>
                              handleDeleteExpense(
                                expense.id,
                                expense.description,
                              )
                            }
                          >
                            <Text
                              selectable
                              style={[
                                typographyScale.headingSm,
                                { color: colorSemanticTokens.state.danger },
                              ]}
                            >
                              Delete
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}
