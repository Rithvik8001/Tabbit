import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "@/design/primitives/sora-native";

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
  areExpenseReceiptsEnabled,
  pickAndPrepareExpenseReceipt,
  uploadAndAttachExpenseReceipt,
} from "@/features/groups/lib/expense-receipt-upload";
import {
  getTodayString,
  SPLIT_TYPE_OPTIONS,
  MAX_DESCRIPTION_LENGTH,
  computeEqualSplits,
  computeExactSplits,
  computePercentSplits,
  validateExpenseForm,
} from "@/features/groups/lib/expense-form-utils";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";
import { useGroupExpenses } from "@/features/groups/hooks/use-group-expenses";
import { ExpenseReceiptCard } from "@/features/groups/components/expense-receipt-card";
import type { PreparedExpenseReceiptUpload } from "@/features/groups/types/expense-receipt.types";
import type { SplitType } from "@/features/groups/types/expense.types";

const stroke = colorSemanticTokens.border.subtle;
const ink = colorSemanticTokens.text.primary;
const muted = colorSemanticTokens.text.secondary;
const accent = colorSemanticTokens.accent.primary;

export default function AddExpenseScreen() {
  const { id, returnTab } = useLocalSearchParams<{
    id: string;
    returnTab?: "friends" | "groups" | "activity" | string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const { group, members } = useGroupDetail(id);
  const { createExpense, isCreating } = useGroupExpenses(id, members);

  const [description, setDescription] = useState("");
  const [amountText, setAmountText] = useState("");
  const [dateText, setDateText] = useState(getTodayString());
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
  const [preparedReceipt, setPreparedReceipt] =
    useState<PreparedExpenseReceiptUpload | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const seededGroupIdRef = useRef<string | null>(null);
  const receiptsEnabled = areExpenseReceiptsEnabled();

  useEffect(() => {
    seededGroupIdRef.current = null;
    setPaidBy(null);
    setSelectedParticipants(new Set());
    setExactAmounts({});
    setPercentAmounts({});
    setFormError(null);
    setPreparedReceipt(null);
    setReceiptError(null);
  }, [id]);

  useEffect(() => {
    if (!id || !group || group.id !== id || members.length === 0) {
      return;
    }

    if (seededGroupIdRef.current === id) {
      return;
    }

    const memberUserIds = members.map((member) => member.userId);
    const fallbackPaidBy = members[0]?.userId ?? null;
    const initialPaidBy =
      user?.id && memberUserIds.includes(user.id) ? user.id : fallbackPaidBy;

    if (!initialPaidBy) {
      return;
    }

    setPaidBy((currentValue) => currentValue ?? initialPaidBy);
    setSelectedParticipants((currentValue) =>
      currentValue.size > 0 ? currentValue : new Set(memberUserIds),
    );
    seededGroupIdRef.current = id;
  }, [group, id, members, user?.id]);

  const amountCents = Math.round(parseFloat(amountText || "0") * 100);
  const participantIds = Array.from(selectedParticipants);
  const participantCount = participantIds.length;

  const normalizedReturnTab =
    returnTab === "friends" ||
    returnTab === "groups" ||
    returnTab === "activity"
      ? returnTab
      : null;

  const handleClose = () => {
    if (normalizedReturnTab === "groups") {
      router.dismissTo("/(app)/(tabs)/(groups)");
      return;
    }

    if (normalizedReturnTab === "friends") {
      router.dismissTo("/(app)/(tabs)/(friends)");
      return;
    }

    if (normalizedReturnTab === "activity") {
      router.dismissTo("/(app)/(tabs)/(activity)");
      return;
    }

    router.back();
  };

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

  const handleCreate = () => {
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

    void (async () => {
      const result = await createExpense({
        description: description.trim(),
        amountCents,
        expenseDate: dateText,
        splitType,
        paidBy: paidBy!,
        participants,
      });

      if (!result.ok) {
        Alert.alert("Error", result.message);
        return;
      }

      if (receiptsEnabled && preparedReceipt && result.expenseId && user?.id) {
        setIsUploadingReceipt(true);
        const uploadResult = await uploadAndAttachExpenseReceipt({
          expenseId: result.expenseId,
          uploaderId: user.id,
          preparedReceipt,
        });
        setIsUploadingReceipt(false);

        if (!uploadResult.ok) {
          Alert.alert(
            "Expense saved",
            `${uploadResult.message} You can retry attaching the receipt from Edit Expense.`,
          );
        }
      }

      handleClose();
    })();
  };

  const handlePickReceipt = () => {
    if (!receiptsEnabled) {
      return;
    }

    setReceiptError(null);
    void (async () => {
      const result = await pickAndPrepareExpenseReceipt();

      if (!result.ok) {
        setReceiptError(result.message);
        return;
      }

      setPreparedReceipt(result.data);
    })();
  };

  // Equal split preview
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
        title="Add Expense"
        subtitle="Capture it once. Split it right."
        leading={<HeaderPillButton label="Back" onPress={handleClose} />}
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
          autoFocus
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
      {receiptsEnabled ? (
        <ExpenseReceiptCard
          preparedReceipt={preparedReceipt}
          isBusy={isCreating || isUploadingReceipt}
          error={receiptError}
          onPick={handlePickReceipt}
          onClearPrepared={() => {
            setPreparedReceipt(null);
            setReceiptError(null);
          }}
        />
      ) : null}

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

      {/* Submit */}
      <Button
        label={isCreating || isUploadingReceipt ? "Adding..." : "Add expense"}
        onPress={handleCreate}
        disabled={isCreating || isUploadingReceipt}
        loading={isCreating || isUploadingReceipt}
        size="lg"
      />
    </ScrollView>
  );
}
