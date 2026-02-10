type PersonLabelInput = {
  displayName?: string | null;
  email?: string | null;
  fallback?: string;
};

type GroupMemberLabelInput = PersonLabelInput & {
  isCurrentUser?: boolean;
  selfLabel?: string;
};

function toNonEmptyLabel(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getPersonLabel({
  displayName,
  email,
  fallback = "User",
}: PersonLabelInput): string {
  return toNonEmptyLabel(displayName) ?? toNonEmptyLabel(email) ?? fallback;
}

export function getGroupMemberLabel({
  displayName,
  email,
  isCurrentUser = false,
  selfLabel = "You",
  fallback = "Former member",
}: GroupMemberLabelInput): string {
  if (isCurrentUser) {
    return selfLabel;
  }

  return getPersonLabel({ displayName, email, fallback });
}
