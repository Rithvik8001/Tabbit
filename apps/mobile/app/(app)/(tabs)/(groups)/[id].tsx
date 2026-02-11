import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "@/design/primitives/sora-native";

import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useAuth } from "@/features/auth/state/auth-provider";
import { formatCents } from "@/features/groups/lib/format-currency";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";
import { useGroupExpenses } from "@/features/groups/hooks/use-group-expenses";
import type { ExpenseWithSplits } from "@/features/groups/types/expense.types";
import { formatDateOnly } from "@/features/shared/lib/date-only";
import { getGroupMemberLabel } from "@/features/shared/lib/person-label";

function monthLabel(value: string): string {
  return formatDateOnly(value, {
    month: "long",
    year: "numeric",
  });
}

function shortDate(value: string): string {
  return formatDateOnly(value, {
    month: "short",
    day: "2-digit",
  });
}

export default function GroupDetailScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { group, members, isLoading, error, refresh } = useGroupDetail(id);
  const {
    expenses,
    userBalance,
    simplifiedDebts,
    deleteExpense,
    isLoading: isExpensesLoading,
    error: expensesError,
    refresh: refreshExpenses,
  } = useGroupExpenses(id, members);
  const isAdmin = members.some(
    (member) => member.userId === user?.id && member.role === "admin",
  );

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

  const memberByUserId = useMemo(() => {
    return new Map(members.map((member) => [member.userId, member]));
  }, [members]);

  const resolvePayerLabel = (expense: ExpenseWithSplits): string => {
    if (expense.paidBy === user?.id) {
      return "You";
    }

    const paidByName = expense.paidByName?.trim();
    if (paidByName) {
      return paidByName;
    }

    const member = memberByUserId.get(expense.paidBy);
    return getGroupMemberLabel({
      displayName: member?.displayName,
      email: member?.email,
    });
  };

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
              { color: colors.text.secondary },
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
                { color: colors.accent.primary },
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
            { color: colors.text.secondary },
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
            borderColor: colors.state.danger,
            backgroundColor: colors.state.dangerSoft,
            padding: spacingTokens.md,
            gap: spacingTokens.sm,
          }}
        >
          <Text
            selectable
            style={[
              typographyScale.headingSm,
              { color: colors.state.danger },
            ]}
          >
            
            {error}
          </Text>
          <Pressable onPress={() => void refresh()}>
            
            <Text
              selectable
              style={[
                typographyScale.headingSm,
                { color: colors.accent.primary },
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
              borderColor: colors.border.subtle,
              backgroundColor: colors.surface.card,
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
                { color: colors.text.primary },
              ]}
            >
              {group.name}
            </Text>
            <Text
              selectable
              style={[
                typographyScale.bodyMd,
                { color: colors.text.secondary },
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
                  backgroundColor: colors.accent.primary,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
              >
                <Text
                  selectable
                  style={[
                    typographyScale.headingSm,
                    { color: colors.text.inverse },
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
                  backgroundColor: colors.background.subtle,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
              >
                <Text
                  selectable
                  style={[
                    typographyScale.headingSm,
                    { color: colors.text.primary },
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
              borderColor: colors.border.subtle,
              backgroundColor: colors.surface.card,
              padding: spacingTokens.cardPadding,
              gap: spacingTokens.sm,
            }}
          >
            <Text
              selectable
              style={[
                typographyScale.headingMd,
                { color: colors.text.primary },
              ]}
            >
              {isExpensesLoading
                ? "Loading balances"
                : expensesError
                  ? "Balance unavailable"
                  : userBalance.direction === "you_are_owed"
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
                    isExpensesLoading || expensesError
                      ? colors.text.secondary
                      : userBalance.direction === "you_are_owed"
                      ? colors.financial.positive
                      : userBalance.direction === "you_owe"
                        ? colors.financial.negative
                        : colors.text.secondary,
                },
              ]}
            >
              {isExpensesLoading
                ? "..."
                : expensesError
                  ? "—"
                  : userBalance.direction === "settled"
                    ? "$0.00"
                    : formatCents(Math.abs(userBalance.netCents))}
            </Text>

            {isExpensesLoading ? (
              <Text
                selectable
                style={[
                  typographyScale.bodySm,
                  { color: colors.text.secondary },
                ]}
              >
                Loading latest balances...
              </Text>
            ) : null}

            {expensesError ? (
              <View style={{ gap: spacingTokens.xs }}>
                <Text
                  selectable
                  style={[
                    typographyScale.bodySm,
                    { color: colors.state.danger },
                  ]}
                >
                  {expensesError}
                </Text>
                <Pressable onPress={() => void refreshExpenses()}>
                  <Text
                    selectable
                    style={[
                      typographyScale.headingSm,
                      { color: colors.accent.primary },
                    ]}
                  >
                    Retry balances
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {!isExpensesLoading &&
              !expensesError &&
              debtsInvolvingCurrentUser.map((debt) => {
                const isPayer = debt.fromUserId === user?.id;
                const fromLabel = getGroupMemberLabel({
                  displayName: debt.fromName,
                  email: debt.fromEmail,
                  isCurrentUser: debt.fromUserId === user?.id,
                });
                const toLabel = getGroupMemberLabel({
                  displayName: debt.toName,
                  email: debt.toEmail,
                  isCurrentUser: debt.toUserId === user?.id,
                });
                const canRecordPayment =
                  debt.fromIsCurrentMember && debt.toIsCurrentMember;

                return (
                  <View
                    key={`${debt.fromUserId}-${debt.toUserId}`}
                    style={{
                      borderRadius: radiusTokens.control,
                      borderCurve: "continuous",
                      backgroundColor: colors.background.subtle,
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
                        { color: colors.text.primary, flex: 1 },
                      ]}
                    >
                      {isPayer
                        ? `You owe ${toLabel} ${formatCents(debt.amountCents)}`
                        : `${fromLabel} owes you ${formatCents(debt.amountCents)}`}
                    </Text>
                    {canRecordPayment ? (
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
                            { color: colors.accent.primary },
                          ]}
                        >
                          Record payment
                        </Text>
                      </Pressable>
                    ) : (
                      <Text
                        selectable
                        style={[
                          typographyScale.bodySm,
                          { color: colors.text.tertiary },
                        ]}
                      >
                        Unavailable
                      </Text>
                    )}
                  </View>
                );
              })}
          </View>

          {isExpensesLoading ? (
            <Text
              selectable
              style={[
                typographyScale.bodyMd,
                { color: colors.text.secondary },
              ]}
            >
              Loading expenses...
            </Text>
          ) : null}

          {expensesError ? (
            <View
              style={{
                borderRadius: radiusTokens.card,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: colors.state.danger,
                backgroundColor: colors.state.dangerSoft,
                padding: spacingTokens.md,
                gap: spacingTokens.sm,
              }}
            >
              <Text
                selectable
                style={[
                  typographyScale.headingSm,
                  { color: colors.state.danger },
                ]}
              >
                Could not load expenses
              </Text>
              <Text
                selectable
                style={[
                  typographyScale.bodySm,
                  { color: colors.state.danger },
                ]}
              >
                {expensesError}
              </Text>
              <Pressable onPress={() => void refreshExpenses()}>
                <Text
                  selectable
                  style={[
                    typographyScale.headingSm,
                    { color: colors.accent.primary },
                  ]}
                >
                  Retry expenses
                </Text>
              </Pressable>
            </View>
          ) : null}

          {!isExpensesLoading && !expensesError && groupedExpenses.map((bucket) => (
            <View key={bucket.label} style={{ gap: spacingTokens.sm }}>
              
              <Text
                selectable
                style={[
                  typographyScale.headingMd,
                  { color: colors.text.primary },
                ]}
              >
                {bucket.label}
              </Text>
              {bucket.items.map((expense) => {
                const canDelete =
                  expense.createdBy === user?.id ||
                  isAdmin;
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
                      borderColor: colors.border.subtle,
                      backgroundColor: colors.surface.card,
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
                            { color: colors.text.primary },
                          ]}
                        >
                          {expense.description}
                        </Text>
                        <Text
                          selectable
                          style={[
                            typographyScale.bodySm,
                            { color: colors.text.secondary },
                          ]}
                        >
                          {`Paid by ${resolvePayerLabel(expense)} · ${shortDate(expense.expenseDate)}`}
                        </Text>
                        {expense.receiptObjectPath ? (
                          <Pressable
                            onPress={() => {
                              router.push({
                                pathname: "/(app)/receipt-preview",
                                params: { expenseId: expense.id },
                              });
                            }}
                          >
                            <Text
                              selectable
                              style={[
                                typographyScale.bodySm,
                                { color: colors.accent.primary },
                              ]}
                            >
                              Receipt attached · View
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                      <Text
                        selectable
                        style={[
                          typographyScale.headingMd,
                          { color: colors.text.primary },
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
                                { color: colors.accent.primary },
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
                                { color: colors.state.danger },
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
