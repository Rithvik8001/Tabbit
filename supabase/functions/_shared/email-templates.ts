// Branded email templates for Tabbit notifications
// Table-based layout with inline CSS for maximum email client compatibility

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CATEGORY = {
  friend: { accent: "#58CC02", bg: "#E8F5E9", label: "FRIENDS" },
  group: { accent: "#1CB0F6", bg: "#E3F2FD", label: "GROUPS" },
  expense: { accent: "#FF9800", bg: "#FFF3E0", label: "EXPENSES" },
} as const;

type Category = keyof typeof CATEGORY;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function emojiCircle(emoji: string, bgColor: string): string {
  return `<td width="48" height="48" align="center" valign="middle" style="width:48px;height:48px;border-radius:24px;background-color:${bgColor};font-size:22px;line-height:48px;">
    ${emoji}
  </td>`;
}

function ctaButton(label: string, accentColor: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
    <tr>
      <td align="center" style="border-radius:12px;background-color:${accentColor};">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td align="center" style="border-radius:12px;background-color:${accentColor};padding:14px 32px;font-family:${FONT_STACK};font-size:15px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.8px;">
              ${escapeHtml(label)}
            </td>
          </tr>
          <tr>
            <td height="3" style="height:3px;border-radius:0 0 12px 12px;background-color:rgba(0,0,0,0.15);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function contentCard(
  emoji: string,
  title: string,
  body: string,
  category: Category,
): string {
  const { accent, bg } = CATEGORY[category];
  return `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-radius:12px;background-color:${bg};border:1px solid ${bg};">
    <tr>
      <td style="padding:20px 24px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            ${emojiCircle(emoji, "#ffffff")}
            <td width="12" style="width:12px;"></td>
            <td style="font-family:${FONT_STACK};font-size:13px;font-weight:700;color:${accent};text-transform:uppercase;letter-spacing:0.8px;">
              ${escapeHtml(title)}
            </td>
          </tr>
        </table>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td height="12" style="height:12px;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="font-family:${FONT_STACK};font-size:15px;line-height:22px;color:#333333;">
              ${body}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function wrapInLayout(category: Category, innerHtml: string): string {
  const { accent, label } = CATEGORY[category];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tabbit</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F7F7;font-family:${FONT_STACK};">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#F7F7F7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;border-radius:16px;border:2px solid #E5E5E5;background-color:#FFFFFF;overflow:hidden;">
          <!-- Accent bar -->
          <tr>
            <td height="4" style="height:4px;background-color:${accent};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="padding:20px 24px 16px 24px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-family:${FONT_STACK};font-size:24px;font-weight:700;color:#0F172A;">
                    Tabbit
                  </td>
                  <td align="right" valign="middle">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:4px 10px;border-radius:8px;background-color:${accent};font-family:${FONT_STACK};font-size:11px;font-weight:700;color:#FFFFFF;text-transform:uppercase;letter-spacing:0.8px;">
                          ${escapeHtml(label)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 24px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td height="1" style="height:1px;background-color:#E5E5E5;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:24px;">
              ${innerHtml}
            </td>
          </tr>
          <!-- Footer divider -->
          <tr>
            <td style="padding:0 24px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td height="1" style="height:1px;background-color:#E5E5E5;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px;font-family:${FONT_STACK};font-size:13px;color:#999999;text-align:center;line-height:20px;">
              Tabbit &mdash; Split expenses with friends<br>
              Manage notification preferences in the app.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// --- Template builders ---

export function friendRequestEmail(requesterName: string): string {
  const safe = escapeHtml(requesterName);
  const card = contentCard(
    "\u{1F44B}",
    "New Friend Request",
    `<strong>${safe}</strong> sent you a friend request on Tabbit.`,
    "friend",
  );
  const helper = `<table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td height="16" style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr>
      <td style="font-family:${FONT_STACK};font-size:14px;color:#666666;text-align:center;">
        Open the app to accept or decline.
      </td>
    </tr>
    <tr><td height="20" style="height:20px;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>`;
  const cta = ctaButton("Open Tabbit", CATEGORY.friend.accent);
  return wrapInLayout("friend", card + helper + cta);
}

export function friendAcceptedEmail(acceptorName: string): string {
  const safe = escapeHtml(acceptorName);
  const card = contentCard(
    "\u{1F389}",
    "Friend Request Accepted",
    `<strong>${safe}</strong> accepted your friend request on Tabbit.`,
    "friend",
  );
  const helper = `<table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td height="16" style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr>
      <td style="font-family:${FONT_STACK};font-size:14px;color:#666666;text-align:center;">
        You can now split expenses together!
      </td>
    </tr>
    <tr><td height="20" style="height:20px;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>`;
  const cta = ctaButton("Open Tabbit", CATEGORY.friend.accent);
  return wrapInLayout("friend", card + helper + cta);
}

export function addedToGroupEmail(groupLabel: string): string {
  const safe = escapeHtml(groupLabel);
  const card = contentCard(
    "\u{1F465}",
    "Added to Group",
    `You were added to <strong>${safe}</strong> on Tabbit.`,
    "group",
  );
  const helper = `<table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td height="16" style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr>
      <td style="font-family:${FONT_STACK};font-size:14px;color:#666666;text-align:center;">
        Open the app to see the group.
      </td>
    </tr>
    <tr><td height="20" style="height:20px;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>`;
  const cta = ctaButton("Open Tabbit", CATEGORY.group.accent);
  return wrapInLayout("group", card + helper + cta);
}

export function newExpenseEmail(
  payerName: string,
  description: string,
  amount: string,
  groupLabel: string,
): string {
  const safePayer = escapeHtml(payerName);
  const safeDesc = escapeHtml(description);
  const safeAmount = escapeHtml(amount);
  const safeGroup = escapeHtml(groupLabel);
  const card = contentCard(
    "\u{1F4B8}",
    "New Expense",
    `<strong>${safePayer}</strong> added <strong>&ldquo;${safeDesc}&rdquo;</strong> (${safeAmount}) in ${safeGroup}.`,
    "expense",
  );
  const helper = `<table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td height="16" style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr>
      <td style="font-family:${FONT_STACK};font-size:14px;color:#666666;text-align:center;">
        Open the app to see the details.
      </td>
    </tr>
    <tr><td height="20" style="height:20px;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>`;
  const cta = ctaButton("Open Tabbit", CATEGORY.expense.accent);
  return wrapInLayout("expense", card + helper + cta);
}

export function settlementRecordedEmail(
  payerName: string,
  amount: string,
  groupLabel: string,
): string {
  const safePayer = escapeHtml(payerName);
  const safeAmount = escapeHtml(amount);
  const safeGroup = escapeHtml(groupLabel);
  const card = contentCard(
    "\u{2705}",
    "Settlement Recorded",
    `<strong>${safePayer}</strong> settled <strong>${safeAmount}</strong> with you in ${safeGroup}.`,
    "expense",
  );
  const helper = `<table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td height="16" style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr>
      <td style="font-family:${FONT_STACK};font-size:14px;color:#666666;text-align:center;">
        Open the app to see the details.
      </td>
    </tr>
    <tr><td height="20" style="height:20px;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>`;
  const cta = ctaButton("Open Tabbit", CATEGORY.expense.accent);
  return wrapInLayout("expense", card + helper + cta);
}
