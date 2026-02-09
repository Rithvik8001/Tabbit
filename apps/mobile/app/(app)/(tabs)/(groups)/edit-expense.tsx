import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/design/primitives/button";
import {
  HeaderPillButton,
  PageHeading,
} from "@/design/primitives/page-heading";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { useAuth } from "@/features/auth/state/auth-provider";
import { formatCents } from "@/features/groups/lib/format-currency";
import {
  SPLIT_TYPE_OPTIONS,
  MAX_DESCRIPTION_LENGTH,
  computeEqualSplits,
  computeExactSplits,
  computePercentSplits,
  validateExpenseForm,
} from "@/features/groups/lib/expense-form-utils";
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "@/features/groups/lib/expenses-repository";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";
import type {
  SplitType,
  ExpenseWithSplits,
} from "@/features/groups/types/expense.types";

const stroke = colorSemanticTokens.border.subtle;
const ink = colorSemanticTokens.text.primary;
const muted = colorSemanticTokens.text.secondary;
const accent = colorSemanticTokens.accent.primary;

export default function EditExpenseScreen() {
  const { id, expenseId } = useLocalSearchParams<{
    id: string;
    expenseId: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const { members } = useGroupDetail(id);

  const [expense, setExpense] = useState<ExpenseWithSplits | null>(null);
  const [isLoadingExpense, setIsLoadingExpense] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [amountText, setAmountText] = useState("");
  const [dateText, setDateText] = useState("");
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [paidBy, setPaidBy] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(
    new Set(),
  );
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentAmounts, setPercentAmounts] = useState<Record<string, string>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch expense on mount
  useEffect(() => {
    if (!expenseId) return;

    void (async () => {
      setIsLoadingExpense(true);
      setLoadError(null);
      const result = await getExpenseById(expenseId);
      if (result.ok) {
        const e = result.data;
        setExpense(e);
        setDescription(e.description);
        setAmountText((e.amountCents / 100).toFixed(2));
        setDateText(e.expenseDate);
        setSplitType(e.splitType);
        setPaidBy(e.paidBy);
        setSelectedParticipants(new Set(e.splits.map((s) => s.userId)));
        if (e.splitType === "exact") {
          const exact: Record<string, string> = {};
          for (const s of e.splits) {
            exact[s.userId] = (s.shareCents / 100).toFixed(2);
          }
          setExactAmounts(exact);
        }
        if (e.splitType === "percent") {
          const pcts: Record<string, string> = {};
          for (const s of e.splits) {
            pcts[s.userId] = String(s.percentShare ?? 0);
          }
          setPercentAmounts(pcts);
        }
      } else {
        setLoadError(result.message);
      }
      setIsLoadingExpense(false);
    })();
  }, [expenseId]);

  const amountCents = Math.round(parseFloat(amountText || "0") * 100);
  const participantIds = Array.from(selectedParticipants);
  const participantCount = participantIds.length;

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSave = useCallback(() => {
    const validationError = validateExpenseForm({
      description,
      amountText,
      amountCents,
      paidBy,
      participantIds,
      dateText,
      splitType,
      exactAmounts,
      percentAmounts,
    });

    if (validationError) {
      setFormError(validationError);
      return;
    }

    let participants;
    if (splitType === "equal") {
      participants = computeEqualSplits(participantIds, amountCents);
    } else if (splitType === "exact") {
      participants = computeExactSplits(participantIds, exactAmounts);
    } else {
      participants = computePercentSplits(
        participantIds,
        percentAmounts,
        amountCents,
      );
    }

    setFormError(null);
    setIsSaving(true);

    void (async () => {
      const result = await updateExpense(expenseId, {
        description: description.trim(),
        amountCents,
        expenseDate: dateText,
        splitType,
        paidBy: paidBy!,
        participants,
      });

      setIsSaving(false);

      if (!result.ok) {
        Alert.alert("Error", result.message);
        return;
      }

      router.back();
    })();
  }, [
    description,
    amountText,
    amountCents,
    paidBy,
    participantIds,
    dateText,
    splitType,
    exactAmounts,
    percentAmounts,
    expenseId,
    router,
  ]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Expense",
      `Delete "${expense?.description ?? "this expense"}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setIsDeleting(true);
            void (async () => {
              const result = await deleteExpense(expenseId);
              setIsDeleting(false);
              if (!result.ok) {
                Alert.alert("Error", result.message);
                return;
              }
              router.back();
            })();
          },
        },
      ],
    );
  }, [expense?.description, expenseId, router]);

  // Loading state
  if (isLoadingExpense) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24,
          gap: 12,
        }}
      >
        <PageHeading
          size="section"
          title="Edit Expense"
          subtitle="Update amount, split, and participants."
          leading={
            <HeaderPillButton label="Back" onPress={() => router.back()} />
          }
        />
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            backgroundColor: colorSemanticTokens.surface.card,
            padding: 20,
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={accent} />
        </View>
      </ScrollView>
    );
  }

  // Error state
  if (loadError) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24,
          gap: 12,
        }}
      >
        <PageHeading
          size="section"
          title="Edit Expense"
          subtitle="Update amount, split, and participants."
          leading={
            <HeaderPillButton label="Back" onPress={() => router.back()} />
          }
        />
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            backgroundColor: colorSemanticTokens.surface.card,
            padding: 16,
            gap: 8,
          }}
        >
          <Text
            selectable
            style={{
              color: ink,
              fontSize: 18,
              lineHeight: 22,
              fontWeight: "600",
            }}
          >
            Could not load expense
          </Text>
          <Text
            selectable
            style={{
              color: muted,
              fontSize: 15,
              lineHeight: 20,
              fontWeight: "500",
            }}
          >
            {loadError}
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Guard: settlement
  if (expense?.entryType === "settlement") {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24,
          gap: 12,
        }}
      >
        <PageHeading
          size="section"
          title="Edit Expense"
          subtitle="Update amount, split, and participants."
          leading={
            <HeaderPillButton label="Back" onPress={() => router.back()} />
          }
        />
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            backgroundColor: colorSemanticTokens.surface.card,
            padding: 16,
            gap: 8,
          }}
        >
          <Text
            selectable
            style={{
              color: ink,
              fontSize: 18,
              lineHeight: 22,
              fontWeight: "600",
            }}
          >
            Settlements cannot be edited
          </Text>
          <Text
            selectable
            style={{
              color: muted,
              fontSize: 15,
              lineHeight: 20,
              fontWeight: "500",
            }}
          >
            Delete and re-create the settlement if needed.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Guard: not creator
  if (expense && user && expense.createdBy !== user.id) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24,
          gap: 12,
        }}
      >
        <PageHeading
          size="section"
          title="Edit Expense"
          subtitle="Update amount, split, and participants."
          leading={
            <HeaderPillButton label="Back" onPress={() => router.back()} />
          }
        />
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            backgroundColor: colorSemanticTokens.surface.card,
            padding: 16,
            gap: 8,
          }}
        >
          <Text
            selectable
            style={{
              color: ink,
              fontSize: 18,
              lineHeight: 22,
              fontWeight: "600",
            }}
          >
            Only the creator can edit this expense
          </Text>
        </View>
      </ScrollView>
    );
  }

  const equalPreview =
    splitType === "equal" && amountCents > 0 && participantCount >= 2
      ? `${formatCents(Math.floor(amountCents / participantCount))} each`
      : null;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        gap: 12,
      }}
    >
      <PageHeading
        size="section"
        title="Edit Expense"
        subtitle="Update amount, split, and participants."
        leading={
          <HeaderPillButton label="Back" onPress={() => router.back()} />
        }
      />

      {/* Description */}
      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: colorSemanticTokens.surface.card,
          padding: 16,
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text
            selectable
            style={{
              color: ink,
              fontSize: 18,
              lineHeight: 22,
              fontWeight: "600",
            }}
          >
            Description
          </Text>
          <Text
            selectable
            style={{
              color: muted,
              fontSize: 13,
              lineHeight: 16,
              fontWeight: "600",
            }}
          >
            {description.trim().length}/{MAX_DESCRIPTION_LENGTH}
          </Text>
        </View>

        <TextInput
          value={description}
          onChangeText={setDescription}
          maxLength={MAX_DESCRIPTION_LENGTH}
          placeholder="e.g. Dinner at Nobu"
          placeholderTextColor={colorSemanticTokens.text.tertiary}
          selectionColor={accent}
          style={{
            borderRadius: radiusTokens.control,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: stroke,
            backgroundColor: colorSemanticTokens.background.subtle,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: ink,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "600",
          }}
        />
      </View>

      {/* Amount */}
      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: colorSemanticTokens.surface.card,
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{
            color: ink,
            fontSize: 18,
            lineHeight: 22,
            fontWeight: "600",
          }}
        >
          Amount
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: radiusTokens.control,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: stroke,
            backgroundColor: colorSemanticTokens.background.subtle,
            paddingHorizontal: 14,
          }}
        >
          <Text
            selectable
            style={{
              color: muted,
              fontSize: 20,
              lineHeight: 24,
              fontWeight: "600",
            }}
          >
            $
          </Text>
          <TextInput
            value={amountText}
            onChangeText={setAmountText}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colorSemanticTokens.text.tertiary}
            selectionColor={accent}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 6,
              color: ink,
              fontSize: 20,
              lineHeight: 24,
              fontWeight: "600",
            }}
          />
        </View>
      </View>

      {/* Date */}
      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: colorSemanticTokens.surface.card,
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{
            color: ink,
            fontSize: 18,
            lineHeight: 22,
            fontWeight: "600",
          }}
        >
          Date
        </Text>

        <TextInput
          value={dateText}
          onChangeText={setDateText}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colorSemanticTokens.text.tertiary}
          selectionColor={accent}
          style={{
            borderRadius: radiusTokens.control,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: stroke,
            backgroundColor: colorSemanticTokens.background.subtle,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: ink,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "600",
          }}
        />
      </View>

      {/* Who paid */}
      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: colorSemanticTokens.surface.card,
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{
            color: ink,
            fontSize: 18,
            lineHeight: 22,
            fontWeight: "600",
          }}
        >
          Who paid?
        </Text>

        <View style={{ gap: 8 }}>
          {members.map((member) => {
            const isSelected = paidBy === member.userId;
            const label = member.displayName || member.email || "Unknown";
            const isSelf = member.userId === user?.id;

            return (
              <Pressable
                key={member.userId}
                onPress={() => setPaidBy(member.userId)}
                style={{
                  borderRadius: radiusTokens.control,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: isSelected
                    ? colorSemanticTokens.accent.primary
                    : stroke,
                  backgroundColor: isSelected
                    ? colorSemanticTokens.accent.soft
                    : colorSemanticTokens.surface.cardStrong,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <Text
                  selectable
                  style={{
                    color: isSelected ? accent : ink,
                    fontSize: 16,
                    lineHeight: 20,
                    fontWeight: "600",
                  }}
                >
                  {label}
                  {isSelf ? " (you)" : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Split type */}
      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: colorSemanticTokens.surface.card,
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{
            color: ink,
            fontSize: 18,
            lineHeight: 22,
            fontWeight: "600",
          }}
        >
          Split type
        </Text>

        <View style={{ gap: 8 }}>
          {SPLIT_TYPE_OPTIONS.map((option) => {
            const isSelected = splitType === option.type;

            return (
              <Pressable
                key={option.type}
                onPress={() => setSplitType(option.type)}
                style={{
                  borderRadius: radiusTokens.control,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: isSelected
                    ? colorSemanticTokens.accent.primary
                    : stroke,
                  backgroundColor: isSelected
                    ? colorSemanticTokens.accent.soft
                    : colorSemanticTokens.surface.cardStrong,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  gap: 4,
                }}
              >
                <Text
                  selectable
                  style={{
                    color: isSelected ? accent : ink,
                    fontSize: 16,
                    lineHeight: 20,
                    fontWeight: "600",
                  }}
                >
                  {option.label}
                </Text>
                <Text
                  selectable
                  style={{
                    color: muted,
                    fontSize: 13,
                    lineHeight: 16,
                    fontWeight: "500",
                  }}
                >
                  {option.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Participants */}
      <View
        style={{
          borderRadius: radiusTokens.card,
          borderCurve: "continuous",
          backgroundColor: colorSemanticTokens.surface.card,
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          selectable
          style={{
            color: ink,
            fontSize: 18,
            lineHeight: 22,
            fontWeight: "600",
          }}
        >
          Participants ({participantCount})
        </Text>

        <View style={{ gap: 8 }}>
          {members.map((member) => {
            const isChecked = selectedParticipants.has(member.userId);
            const label = member.displayName || member.email || "Unknown";
            const isSelf = member.userId === user?.id;

            return (
              <View key={member.userId} style={{ gap: 6 }}>
                <Pressable
                  onPress={() => toggleParticipant(member.userId)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: radiusTokens.control,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: isChecked
                      ? colorSemanticTokens.accent.primary
                      : stroke,
                    backgroundColor: isChecked
                      ? colorSemanticTokens.accent.soft
                      : colorSemanticTokens.surface.cardStrong,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderCurve: "continuous",
                      borderWidth: 2,
                      borderColor: isChecked
                        ? accent
                        : colorSemanticTokens.border.muted,
                      backgroundColor: isChecked ? accent : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isChecked ? (
                      <Text
                        style={{
                          color: colorSemanticTokens.text.inverse,
                          fontSize: 13,
                          lineHeight: 15,
                          fontWeight: "600",
                        }}
                      >
                        ✓
                      </Text>
                    ) : null}
                  </View>

                  <Text
                    selectable
                    style={{
                      flex: 1,
                      color: isChecked ? accent : ink,
                      fontSize: 16,
                      lineHeight: 20,
                      fontWeight: "600",
                    }}
                  >
                    {label}
                    {isSelf ? " (you)" : ""}
                  </Text>

                  {splitType === "equal" && isChecked && equalPreview ? (
                    <Text
                      selectable
                      style={{
                        color: muted,
                        fontSize: 14,
                        lineHeight: 18,
                        fontWeight: "600",
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {equalPreview}
                    </Text>
                  ) : null}
                </Pressable>

                {/* Exact amount input */}
                {splitType === "exact" && isChecked ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginLeft: 32,
                      borderRadius: 10,
                      borderCurve: "continuous",
                      borderWidth: 1,
                      borderColor: stroke,
                      backgroundColor: colorSemanticTokens.surface.cardMuted,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text
                      selectable
                      style={{
                        color: muted,
                        fontSize: 16,
                        lineHeight: 20,
                        fontWeight: "600",
                      }}
                    >
                      $
                    </Text>
                    <TextInput
                      value={exactAmounts[member.userId] ?? ""}
                      onChangeText={(text) =>
                        setExactAmounts((prev) => ({
                          ...prev,
                          [member.userId]: text,
                        }))
                      }
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={colorSemanticTokens.text.tertiary}
                      selectionColor={accent}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 4,
                        color: ink,
                        fontSize: 16,
                        lineHeight: 20,
                        fontWeight: "600",
                      }}
                    />
                  </View>
                ) : null}

                {/* Percent input */}
                {splitType === "percent" && isChecked ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginLeft: 32,
                      borderRadius: 10,
                      borderCurve: "continuous",
                      borderWidth: 1,
                      borderColor: stroke,
                      backgroundColor: colorSemanticTokens.surface.cardMuted,
                      paddingHorizontal: 10,
                    }}
                  >
                    <TextInput
                      value={percentAmounts[member.userId] ?? ""}
                      onChangeText={(text) =>
                        setPercentAmounts((prev) => ({
                          ...prev,
                          [member.userId]: text,
                        }))
                      }
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={colorSemanticTokens.text.tertiary}
                      selectionColor={accent}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 4,
                        color: ink,
                        fontSize: 16,
                        lineHeight: 20,
                        fontWeight: "600",
                      }}
                    />
                    <Text
                      selectable
                      style={{
                        color: muted,
                        fontSize: 16,
                        lineHeight: 20,
                        fontWeight: "600",
                      }}
                    >
                      %
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Equal split preview */}
        {splitType === "equal" && equalPreview && amountCents > 0 ? (
          <Text
            selectable
            style={{
              color: muted,
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "500",
              fontVariant: ["tabular-nums"],
            }}
          >
            Splitting {formatCents(amountCents)} equally: {equalPreview}
          </Text>
        ) : null}
      </View>

      {/* Form error */}
      {formError ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colorSemanticTokens.state.danger,
            backgroundColor: colorSemanticTokens.state.dangerSoft,
            padding: 12,
          }}
        >
          <Text
            selectable
            style={{
              color: colorSemanticTokens.state.danger,
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "600",
            }}
          >
            {formError}
          </Text>
        </View>
      ) : null}

      {/* Save button */}
      <Button
        label={isSaving ? "Saving..." : "Save changes"}
        onPress={handleSave}
        disabled={isSaving}
        loading={isSaving}
        size="lg"
      />

      {/* Delete button */}
      <Button
        label={isDeleting ? "Deleting..." : "Delete expense"}
        onPress={handleDelete}
        disabled={isDeleting}
        loading={isDeleting}
        variant="soft"
        tone="danger"
        size="lg"
      />
    </ScrollView>
  );
}
