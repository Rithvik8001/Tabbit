import { ScrollView, Text, View } from "react-native";

import {
  formatCurrency,
  formatShortDate,
  receiptItems,
  type ReceiptStatus,
} from "@/features/app-shell/mock/tab-mock-data";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";

function statusLabel(status: ReceiptStatus): string {
  if (status === "needs_review") {
    return "Needs review";
  }
  if (status === "processed") {
    return "Processed";
  }
  return "Scanned";
}

function statusColor(status: ReceiptStatus): string {
  if (status === "needs_review") {
    return "#A65D00";
  }
  if (status === "processed") {
    return accent;
  }
  return muted;
}

export default function ReceiptsTabScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 12,
      }}
    >
      {receiptItems.map((receipt) => (
        <View
          key={receipt.id}
          style={{
            borderRadius: 18,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: stroke,
            backgroundColor: surface,
            padding: 14,
            gap: 8,
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
                flex: 1,
                color: ink,
                fontSize: 18,
                lineHeight: 22,
                fontWeight: "700",
              }}
            >
              {receipt.merchant}
            </Text>
            <Text
              selectable
              style={{
                color: ink,
                fontSize: 18,
                lineHeight: 22,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
              }}
            >
              {formatCurrency(receipt.amount)}
            </Text>
          </View>

          <Text
            selectable
            style={{ color: muted, fontSize: 14, lineHeight: 18, fontWeight: "500" }}
          >
            {receipt.groupName} • Added by {receipt.submittedBy} •{" "}
            {formatShortDate(receipt.scannedAt)}
          </Text>

          <View
            style={{
              alignSelf: "flex-start",
              borderRadius: 999,
              borderCurve: "continuous",
              paddingHorizontal: 10,
              paddingVertical: 4,
              backgroundColor:
                receipt.status === "processed"
                  ? "#ECE9FF"
                  : receipt.status === "needs_review"
                    ? "#FFF4E5"
                    : "#F2F4F8",
            }}
          >
            <Text
              selectable
              style={{
                color: statusColor(receipt.status),
                fontSize: 12,
                lineHeight: 16,
                fontWeight: "700",
              }}
            >
              {statusLabel(receipt.status)}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
