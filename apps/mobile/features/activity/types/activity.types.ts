export type ActivityRowVM = {
  id: string;
  groupId: string;
  title: string;
  subtitle: string;
  timestampLabel: string;
  impactLabel: string;
  impactAmount: string;
  hasReceipt: boolean;
  tone: "positive" | "negative" | "neutral";
};
