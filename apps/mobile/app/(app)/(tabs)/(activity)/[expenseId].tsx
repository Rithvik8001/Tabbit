import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "@/design/primitives/sora-native";

import { Button } from "@/design/primitives/button";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useAuth } from "@/features/auth/state/auth-provider";
import {
  deleteExpense,
  getExpenseById,
} from "@/features/groups/lib/expenses-repository";
import { formatCents } from "@/features/groups/lib/format-currency";
import type { ExpenseWithSplits } from "@/features/groups/types/expense.types";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";
import { getGroupMemberLabel } from "@/features/shared/lib/person-label";
import { formatDateOnly } from "@/features/shared/lib/date-only";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  year: "numeric",
};

export default function ExpenseDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    expenseId: string;
    groupId?: string;
    groupName?: string;
  }>();

  const expenseId = params.expenseId;
  const passedGroupId = params.groupId;
  const passedGroupName = params.groupName;

  const [expense, setExpense] = useState<ExpenseWithSplits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { group, members } = useGroupDetail(expense?.groupId ?? passedGroupId);

  const fetchExpense = useCallback(async () => {
    if (!expenseId) {
      setError("No expense ID provided.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await getExpenseById(expenseId);

    if (!result.ok) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    setExpense(result.data);
    setError(null);
    setIsLoading(false);
  }, [expenseId]);

  useEffect(() => {
    void fetchExpense();
  }, [fetchExpense]);

  const currentUserId = user?.id ?? "";
  const isCreator = expense?.createdBy === currentUserId;
  const isAdmin = members.some(
    (m) => m.userId === currentUserId && m.role === "admin",
  );
  const isSettlement = expense?.entryType === "settlement";
  const canEdit = isCreator && !isSettlement;
  const canDelete = isCreator || isAdmin;

  const memberMap = new Map(
    members.map((m) => [m.userId, { displayName: m.displayName, email: m.email }]),
  );

  function resolveName(userId: string): string {
    const info = memberMap.get(userId);
    return getGroupMemberLabel({
      displayName: info?.displayName,
      email: info?.email,
      isCurrentUser: userId === currentUserId,
    });
  }

  function handleEdit() {
    if (!expense) return;
    router.push({
      pathname: "/(app)/(tabs)/(groups)/edit-expense",
      params: { id: expense.groupId, expenseId: expense.id },
    });
  }

  function handleDelete() {
    if (!expense) return;
    Alert.alert("Delete this expense?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void (async () => {
            setIsDeleting(true);
            const result = await deleteExpense(expense.id);
            setIsDeleting(false);
            if (!result.ok) {
              Alert.alert("Error", result.message);
              return;
            }
            router.back();
          })();
        },
      },
    ]);
  }

  function handleReceiptPreview() {
    if (!expense) return;
    router.push({
      pathname: "/(app)/receipt-preview",
      params: { expenseId: expense.id },
    });
  }

  function handleGroupPress() {
    if (!expense) return;
    router.push({
      pathname: "/(app)/(tabs)/(groups)/[id]",
      params: { id: expense.groupId },
    });
  }

  const groupDisplayName =
    group?.name ?? passedGroupName ?? "Group";
  const groupEmoji = group?.emoji ?? null;
  const groupChipLabel = groupEmoji
    ? `${groupEmoji} ${groupDisplayName}`
    : groupDisplayName;

  const hasReceipt = Boolean(
    expense?.receiptBucket && expense?.receiptObjectPath,
  );

  const wasUpdated =
    expense &&
    expense.updatedAt &&
    expense.createdAt &&
    new Date(expense.updatedAt).getTime() -
      new Date(expense.createdAt).getTime() >
      5000;

  // Determine user's split impact
  const userSplit = expense?.splits.find((s) => s.userId === currentUserId);
  const isPayer = expense?.paidBy === currentUserId;

  function getUserImpact(): {
    label: string;
    tone: "positive" | "negative" | "neutral";
  } {
    if (!expense || !userSplit) {
      if (isPayer) {
        return { label: `You paid ${formatCents(expense?.amountCents ?? 0)}`, tone: "positive" };
      }
      return { label: "Not involved", tone: "neutral" };
    }

    if (isSettlement) {
      if (isPayer) {
        return { label: `You paid ${formatCents(expense.amountCents)}`, tone: "neutral" };
      }
      return { label: `You received ${formatCents(userSplit.shareCents)}`, tone: "neutral" };
    }

    if (isPayer) {
      const lent = expense.amountCents - userSplit.shareCents;
      if (lent > 0) {
        return { label: `You lent ${formatCents(lent)}`, tone: "positive" };
      }
      return { label: `You paid your share`, tone: "neutral" };
    }

    return { label: `You owe ${formatCents(userSplit.shareCents)}`, tone: "negative" };
  }

  const impact = expense ? getUserImpact() : null;

  return (
    <ScreenContainer>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 44,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{
            paddingVertical: spacingTokens.sm,
            paddingRight: spacingTokens.md,
          }}
        >
          <Text
            style={[
              typographyScale.headingSm,
              { color: colors.accent.primary },
            ]}
          >
            Back
          </Text>
        </Pressable>

        <Text
          style={[
            typographyScale.headingSm,
            { color: colors.text.primary },
          ]}
        >
          Details
        </Text>

        <View style={{ flexDirection: "row", gap: spacingTokens.md }}>
          {canDelete && expense ? (
            <Pressable
              onPress={handleDelete}
              hitSlop={8}
              disabled={isDeleting}
              style={{ paddingVertical: spacingTokens.sm }}
            >
              <Text
                style={[
                  typographyScale.headingSm,
                  { color: colors.state.danger },
                ]}
              >
                Delete
              </Text>
            </Pressable>
          ) : null}
          {canEdit && expense ? (
            <Pressable
              onPress={handleEdit}
              hitSlop={8}
              style={{ paddingVertical: spacingTokens.sm }}
            >
              <Text
                style={[
                  typographyScale.headingSm,
                  { color: colors.accent.primary },
                ]}
              >
                Edit
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Loading */}
      {isLoading ? (
        <View
          style={{ alignItems: "center", paddingVertical: spacingTokens["4xl"] }}
        >
          <ActivityIndicator
            size="small"
            color={colors.accent.primary}
          />
        </View>
      ) : null}

      {/* Error */}
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
            Could not load expense
          </Text>
          <Text
            selectable
            style={[
              typographyScale.bodySm,
              { color: colors.state.danger },
            ]}
          >
            {error}
          </Text>
          <Button
            label="Retry"
            variant="soft"
            onPress={() => void fetchExpense()}
          />
        </View>
      ) : null}

      {/* Content */}
      {!isLoading && expense ? (
        <View style={{ gap: spacingTokens.lg }}>
          {/* Hero card */}
          <View
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colors.border.subtle,
              backgroundColor: colors.surface.card,
              padding: spacingTokens.cardPadding,
              gap: spacingTokens.lg,
            }}
          >
            {/* Title + amount */}
            <View style={{ gap: spacingTokens.xs }}>
              <Text
                selectable
                style={[
                  typographyScale.headingLg,
                  { color: colors.text.primary },
                ]}
              >
                {isSettlement ? "Payment" : expense.description}
              </Text>
              <Text
                selectable
                style={[
                  typographyScale.displayMd,
                  { color: colors.text.primary },
                ]}
              >
                {formatCents(expense.amountCents)}
              </Text>
            </View>

            {/* Group chip */}
            <Pressable onPress={handleGroupPress}>
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: colors.accent.soft,
                  borderRadius: radiusTokens.pill,
                  paddingHorizontal: spacingTokens.md,
                  paddingVertical: spacingTokens.xs,
                }}
              >
                <Text
                  style={[
                    typographyScale.labelMd,
                    { color: colors.accent.primary },
                  ]}
                >
                  {groupChipLabel}
                </Text>
              </View>
            </Pressable>

            {/* Receipt badge */}
            {hasReceipt ? (
              <Pressable onPress={handleReceiptPreview}>
                <View
                  style={{
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacingTokens.xs,
                    backgroundColor: colors.state.infoSoft,
                    borderRadius: radiusTokens.pill,
                    paddingHorizontal: spacingTokens.md,
                    paddingVertical: spacingTokens.xs,
                  }}
                >
                  <Text
                    style={[
                      typographyScale.labelMd,
                      { color: colors.state.info },
                    ]}
                  >
                    View receipt
                  </Text>
                </View>
              </Pressable>
            ) : null}

            {/* Metadata */}
            <View style={{ gap: spacingTokens.xxs }}>
              <Text
                selectable
                style={[
                  typographyScale.bodySm,
                  { color: colors.text.secondary },
                ]}
              >
                Added by {resolveName(expense.createdBy)} on{" "}
                {formatDateOnly(expense.expenseDate, DATE_FORMAT)}
              </Text>
              {wasUpdated ? (
                <Text
                  selectable
                  style={[
                    typographyScale.bodySm,
                    { color: colors.text.tertiary },
                  ]}
                >
                  Last updated{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(expense.updatedAt))}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Payer + splits card */}
          <View
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colors.border.subtle,
              backgroundColor: colors.surface.card,
              padding: spacingTokens.cardPadding,
              gap: spacingTokens.lg,
            }}
          >
            {/* Payer row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacingTokens.md,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.accent.soft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.accent.primary,
                  }}
                >
                  {resolveName(expense.paidBy).charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text
                selectable
                style={[
                  typographyScale.headingSm,
                  { color: colors.text.primary, flex: 1 },
                ]}
              >
                {isSettlement && expense.splits.length > 0
                  ? `${resolveName(expense.paidBy)} paid ${resolveName(expense.splits[0].userId)}`
                  : `${resolveName(expense.paidBy)} paid ${formatCents(expense.amountCents)}`}
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: colors.border.subtle,
              }}
            />

            {/* Split rows */}
            {!isSettlement ? (
              <View style={{ gap: spacingTokens.md }}>
                <Text
                  style={[
                    typographyScale.labelMd,
                    { color: colors.text.secondary },
                  ]}
                >
                  {expense.splitType === "equal"
                    ? "Split equally"
                    : expense.splitType === "percent"
                      ? "Split by percentage"
                      : "Split by exact amounts"}
                </Text>
                {expense.splits.map((split) => (
                  <View
                    key={split.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacingTokens.md,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor:
                          split.userId === currentUserId
                            ? colors.accent.soft
                            : colors.background.subtle,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color:
                            split.userId === currentUserId
                              ? colors.accent.primary
                              : colors.text.secondary,
                        }}
                      >
                        {resolveName(split.userId).charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      selectable
                      style={[
                        typographyScale.bodyMd,
                        {
                          color: colors.text.primary,
                          flex: 1,
                          fontWeight:
                            split.userId === currentUserId ? "600" : "400",
                        },
                      ]}
                    >
                      {resolveName(split.userId)}
                    </Text>
                    <Text
                      selectable
                      style={[
                        typographyScale.bodyMd,
                        { color: colors.text.secondary },
                      ]}
                    >
                      {formatCents(split.shareCents)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* User impact badge */}
            {impact ? (
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor:
                    impact.tone === "positive"
                      ? colors.state.successSoft
                      : impact.tone === "negative"
                        ? colors.state.dangerSoft
                        : colors.background.subtle,
                  borderRadius: radiusTokens.pill,
                  paddingHorizontal: spacingTokens.md,
                  paddingVertical: spacingTokens.xs,
                }}
              >
                <Text
                  style={[
                    typographyScale.labelMd,
                    {
                      color:
                        impact.tone === "positive"
                          ? colors.state.success
                          : impact.tone === "negative"
                            ? colors.state.danger
                            : colors.text.secondary,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {impact.label}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
