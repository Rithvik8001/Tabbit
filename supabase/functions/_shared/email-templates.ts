// Clean minimal email templates for Tabbit notifications.
// Table-based layout + inline CSS for broad email client compatibility.

export type NotificationEmailPayload = {
  subject: string;
  html: string;
  text: string;
};

type DetailRow = {
  label: string;
  value: string;
};

type NotificationTemplateInput = {
  preheader: string;
  eventLabel: string;
  title: string;
  message: string;
  details?: DetailRow[];
};

const TOKENS = {
  background: "#F3F1F6",
  surface: "#FFFFFF",
  border: "#E2DEE8",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B7280",
  accent: "#5D18EB",
} as const;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeText(value: string, fallback: string): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function renderMessage(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function renderDetailRows(details: DetailRow[]): string {
  if (details.length === 0) {
    return "";
  }

  const rows = details
    .map((detail) => {
      return `<tr>
        <td valign="top" style="padding:8px 0;font-family:${FONT_STACK};font-size:13px;line-height:20px;color:${TOKENS.textSecondary};width:80px;">
          ${escapeHtml(detail.label)}
        </td>
        <td valign="top" style="padding:8px 0;font-family:${FONT_STACK};font-size:13px;line-height:20px;color:${TOKENS.textPrimary};font-weight:600;">
          ${escapeHtml(detail.value)}
        </td>
      </tr>`;
    })
    .join("");

  return `<tr>
    <td style="padding:20px 0 0 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${TOKENS.border};">
        ${rows}
      </table>
    </td>
  </tr>`;
}

function renderNotificationTemplate(input: NotificationTemplateInput): string {
  const detailsHtml = renderDetailRows(input.details ?? []);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tabbit notification</title>
</head>
<body style="margin:0;padding:0;background-color:${TOKENS.background};font-family:${FONT_STACK};">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;line-height:0;mso-hide:all;">
    ${escapeHtml(input.preheader)}
  </span>
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${TOKENS.background};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background-color:${TOKENS.surface};border:1px solid ${TOKENS.border};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid ${TOKENS.border};">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-family:${FONT_STACK};font-size:22px;line-height:28px;font-weight:700;color:${TOKENS.textPrimary};">
                    Tabbit
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;padding:6px 10px;border:1px solid ${TOKENS.accent};border-radius:999px;font-family:${FONT_STACK};font-size:11px;line-height:14px;letter-spacing:0.3px;font-weight:700;color:${TOKENS.accent};text-transform:uppercase;">
                      ${escapeHtml(input.eventLabel)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-family:${FONT_STACK};font-size:24px;line-height:32px;font-weight:700;color:${TOKENS.textPrimary};">
                    ${escapeHtml(input.title)}
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;font-family:${FONT_STACK};font-size:15px;line-height:24px;color:${TOKENS.textSecondary};">
                    ${renderMessage(input.message)}
                  </td>
                </tr>
                ${detailsHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid ${TOKENS.border};font-family:${FONT_STACK};font-size:12px;line-height:18px;color:${TOKENS.textSecondary};text-align:center;">
              Tabbit &middot; Shared expenses made simple.<br>
              You are receiving this transactional notification based on your account activity.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function friendRequestEmail(requesterName: string): NotificationEmailPayload {
  const requester = normalizeText(requesterName, "Someone");
  const subject = `${requester} sent you a friend request`;

  return {
    subject,
    html: renderNotificationTemplate({
      preheader: subject,
      eventLabel: "Friends",
      title: "New friend request",
      message: `${requester} sent you a friend request on Tabbit.`,
    }),
    text: `${requester} sent you a friend request on Tabbit.\nOpen the app to accept or decline it.`,
  };
}

export function friendAcceptedEmail(acceptorName: string): NotificationEmailPayload {
  const acceptor = normalizeText(acceptorName, "Someone");
  const subject = `${acceptor} accepted your friend request`;

  return {
    subject,
    html: renderNotificationTemplate({
      preheader: subject,
      eventLabel: "Friends",
      title: "Friend request accepted",
      message: `${acceptor} accepted your friend request. You can now split expenses together.`,
    }),
    text: `${acceptor} accepted your friend request on Tabbit.\nYou can now split expenses together.`,
  };
}

export function addedToGroupEmail(groupLabel: string): NotificationEmailPayload {
  const group = normalizeText(groupLabel, "your group");
  const subject = `You were added to ${group}`;

  return {
    subject,
    html: renderNotificationTemplate({
      preheader: subject,
      eventLabel: "Groups",
      title: "Added to group",
      message: `You were added to ${group}.`,
      details: [{ label: "Group", value: group }],
    }),
    text: `You were added to ${group} on Tabbit.\nOpen the app to view the group details.`,
  };
}

export function newExpenseEmail(
  payerName: string,
  description: string,
  amount: string,
  groupLabel: string,
): NotificationEmailPayload {
  const payer = normalizeText(payerName, "Someone");
  const safeDescription = normalizeText(description, "an expense");
  const safeAmount = normalizeText(amount, "$0.00");
  const group = normalizeText(groupLabel, "your group");
  const subject = `${payer} added ${safeAmount} in ${group}`;

  return {
    subject,
    html: renderNotificationTemplate({
      preheader: subject,
      eventLabel: "Expenses",
      title: "New expense recorded",
      message: `${payer} added "${safeDescription}" in ${group}.`,
      details: [
        { label: "Amount", value: safeAmount },
        { label: "Group", value: group },
      ],
    }),
    text: `New expense in ${group}.\n${payer} added "${safeDescription}" for ${safeAmount}.`,
  };
}

export function settlementRecordedEmail(
  payerName: string,
  amount: string,
  groupLabel: string,
): NotificationEmailPayload {
  const payer = normalizeText(payerName, "Someone");
  const safeAmount = normalizeText(amount, "$0.00");
  const group = normalizeText(groupLabel, "your group");
  const subject = `${payer} recorded a payment of ${safeAmount}`;

  return {
    subject,
    html: renderNotificationTemplate({
      preheader: subject,
      eventLabel: "Expenses",
      title: "Payment recorded",
      message: `${payer} recorded a payment with you in ${group}.`,
      details: [
        { label: "Amount", value: safeAmount },
        { label: "Group", value: group },
      ],
    }),
    text: `Payment recorded in ${group}.\n${payer} recorded a payment of ${safeAmount} with you.`,
  };
}
