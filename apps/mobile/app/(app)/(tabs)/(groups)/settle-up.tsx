import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import { ExpenseReceiptCard } from "@/features/groups/components/expense-receipt-card";
import {
  areExpenseReceiptsEnabled,
  pickAndPrepareExpenseReceipt,
  uploadAndAttachExpenseReceipt,
} from "@/features/groups/lib/expense-receipt-upload";
import { useGroupDetail } from "@/features/groups/hooks/use-group-detail";
import { createSettlement } from "@/features/groups/lib/expenses-repository";
import { formatCents } from "@/features/groups/lib/format-currency";
import type { PreparedExpenseReceiptUpload } from "@/features/groups/types/expense-receipt.types";
import { getGroupMemberLabel } from "@/features/shared/lib/person-label";

const ink = colorSemanticTokens.text.primary;
const muted = colorSemanticTokens.text.secondary;
const accent = colorSemanticTokens.accent.primary;

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getParamValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default function GroupSettleUpScreen() {
  const params = useLocalSearchParams<{
    id: string;
    fromUserId: string;
    toUserId: string;
    maxAmountCents: string;
  }>();

  const groupId = getParamValue(params.id);
  const fromUserId = getParamValue(params.fromUserId);
  const toUserId = getParamValue(params.toUserId);
  const maxAmountCentsRaw = getParamValue(params.maxAmountCents);

  const router = useRouter();
  const { user } = useAuth();
  const { group, members, isLoading, error, refresh } = useGroupDetail(
    groupId ?? undefined,
  );

  const [amountText, setAmountText] = useState("");
  const [dateText, setDateText] = useState(getTodayString());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preparedReceipt, setPreparedReceipt] =
    useState<PreparedExpenseReceiptUpload | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const receiptsEnabled = areExpenseReceiptsEnabled();

  const maxAmountCents = useMemo(() => {
    if (!maxAmountCentsRaw) {
      return NaN;
    }

    return Number.parseInt(maxAmountCentsRaw, 10);
  }, [maxAmountCentsRaw]);

  useEffect(() => {
    if (!Number.isFinite(maxAmountCents) || maxAmountCents <= 0) {
      setAmountText("");
      return;
    }

    setAmountText((maxAmountCents / 100).toFixed(2));
  }, [maxAmountCents]);

  const fromMember = members.find((member) => member.userId === fromUserId);
  const toMember = members.find((member) => member.userId === toUserId);

  const fromLabel = getGroupMemberLabel({
    displayName: fromMember?.displayName,
    email: fromMember?.email,
  });
  const toLabel = getGroupMemberLabel({
    displayName: toMember?.displayName,
    email: toMember?.email,
  });

  const payerLabel = fromUserId === user?.id ? "You" : fromLabel;
  const payeeLabel = toUserId === user?.id ? "You" : toLabel;

  const handleSubmit = () => {
    if (!user?.id) {
      setFormError("Sign in to record a settlement.");
      return;
    }

    if (!groupId || !fromUserId || !toUserId) {
      setFormError("Settlement details are incomplete.");
      return;
    }

    if (fromUserId === toUserId) {
      setFormError("Payer and payee must be different users.");
      return;
    }

    if (!Number.isFinite(maxAmountCents) || maxAmountCents <= 0) {
      setFormError("Settlement amount limit is invalid.");
      return;
    }

    if (!fromMember || !toMember) {
      setFormError("Could not find both members in this group.");
      return;
    }

    const parsedAmount = Number.parseFloat(amountText);
    const amountCents = Math.round(parsedAmount * 100);

    if (!Number.isFinite(parsedAmount) || amountCents <= 0) {
      setFormError("Enter a valid amount greater than $0.00.");
      return;
    }

    if (amountCents > maxAmountCents) {
      setFormError(
        `Amount cannot exceed ${formatCents(maxAmountCents)} for this settlement.`,
      );
      return;
    }

    if (!dateText.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setFormError("Enter a valid date in YYYY-MM-DD format.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    void (async () => {
      const result = await createSettlement({
        groupId,
        amountCents,
        expenseDate: dateText,
        paidBy: fromUserId,
        paidTo: toUserId,
      });

      setIsSubmitting(false);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      if (
        receiptsEnabled &&
        preparedReceipt &&
        result.data.id &&
        user.id
      ) {
        setIsUploadingReceipt(true);
        const uploadResult = await uploadAndAttachExpenseReceipt({
          expenseId: result.data.id,
          uploaderId: user.id,
          preparedReceipt,
        });
        setIsUploadingReceipt(false);

        if (!uploadResult.ok) {
          Alert.alert(
            "Settlement recorded",
            `${uploadResult.message} The settlement was saved without a receipt.`,
          );
        }
      }

      router.back();
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

  const isDisabled =
    isSubmitting ||
    !user ||
    !groupId ||
    !fromUserId ||
    !toUserId ||
    !Number.isFinite(maxAmountCents);

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
        title="Settle Up"
        subtitle="Record a payment and close the loop."
        leading={
          <HeaderPillButton label="Back" onPress={() => router.back()} />
        }
      />

      {isLoading ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
            backgroundColor: colorSemanticTokens.surface.card,
            padding: 16,
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
            Loading settlement details...
          </Text>
        </View>
      ) : null}

      {error ? (
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
            Could not load group details
          </Text>
          <Text
            selectable
            style={{
              color: muted,
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "400",
            }}
          >
            {error}
          </Text>
          <Pressable
            onPress={() => {
              void refresh();
            }}
            style={{
              alignSelf: "flex-start",
              borderRadius: 999,
              borderCurve: "continuous",
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: colorSemanticTokens.background.subtle,
            }}
          >
            <Text
              selectable
              style={{
                color: ink,
                fontSize: 13,
                lineHeight: 16,
                fontWeight: "600",
              }}
            >
              Try again
            </Text>
          </Pressable>
        </View>
      ) : null}

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
            color: muted,
            fontSize: 14,
            lineHeight: 18,
            fontWeight: "500",
          }}
        >
          Group
        </Text>
        <Text
          selectable
          style={{
            color: ink,
            fontSize: 22,
            lineHeight: 28,
            fontWeight: "600",
          }}
        >
          {group?.emoji ? `${group.emoji} ` : ""}
          {group?.name ?? "Group"}
        </Text>
      </View>

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
          Direction
        </Text>
        <Text
          selectable
          style={{
            color: muted,
            fontSize: 14,
            lineHeight: 18,
            fontWeight: "400",
          }}
        >
          Payer: {payerLabel}
        </Text>
        <Text
          selectable
          style={{
            color: muted,
            fontSize: 14,
            lineHeight: 18,
            fontWeight: "400",
          }}
        >
          Payee: {payeeLabel}
        </Text>
      </View>

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

        <Text
          selectable
          style={{
            color: muted,
            fontSize: 13,
            lineHeight: 16,
            fontWeight: "400",
          }}
        >
          Maximum allowed:{" "}
          {Number.isFinite(maxAmountCents)
            ? formatCents(maxAmountCents)
            : "N/A"}
        </Text>

        <Text
          selectable
          style={{
            color: ink,
            fontSize: 18,
            lineHeight: 22,
            fontWeight: "600",
            marginTop: 6,
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
            backgroundColor: colorSemanticTokens.background.subtle,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: ink,
            fontSize: 16,
            lineHeight: 20,
            fontWeight: "500",
          }}
        />
      </View>

      {receiptsEnabled ? (
        <ExpenseReceiptCard
          preparedReceipt={preparedReceipt}
          isBusy={isSubmitting || isUploadingReceipt}
          error={receiptError}
          onPick={handlePickReceipt}
          onClearPrepared={() => {
            setPreparedReceipt(null);
            setReceiptError(null);
          }}
        />
      ) : null}

      {formError ? (
        <View
          style={{
            borderRadius: radiusTokens.card,
            borderCurve: "continuous",
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
              fontWeight: "500",
            }}
          >
            {formError}
          </Text>
        </View>
      ) : null}

      <Button
        label={
          isSubmitting || isUploadingReceipt
            ? "Recording..."
            : "Record settlement"
        }
        onPress={handleSubmit}
        loading={isSubmitting || isUploadingReceipt}
        disabled={isDisabled || isUploadingReceipt}
        size="lg"
      />
    </ScrollView>
  );
}
