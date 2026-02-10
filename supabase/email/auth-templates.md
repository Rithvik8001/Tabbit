# Tabbit Auth Email Templates (Source of Truth)

This file is the versioned source for Supabase Authentication email templates.

## Design Intent

- Clean minimal layout aligned with Tabbit visual language.
- Neutral surfaces, subtle borders, single accent color (`#5D18EB`).
- Transactional tone only.
- Reset password remains actionable with a functional link.

## Apply in Supabase Dashboard

1. Open Supabase Dashboard.
2. Go to **Authentication > Email Templates**.
3. Paste the HTML from the relevant section below.
4. Save each template.
5. Send a test email from Supabase to verify rendering and placeholders.

## Confirm Signup (OTP)

Use this for the **Confirm signup** template.
Required placeholder: `{{ .Token }}`.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirm your Tabbit account</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F3F1F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;line-height:0;mso-hide:all;">
      Your Tabbit verification code is {{ .Token }}.
    </span>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#F3F1F6;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background-color:#FFFFFF;border:1px solid #E2DEE8;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;border-bottom:1px solid #E2DEE8;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="font-size:22px;line-height:28px;font-weight:700;color:#1A1A1A;">Tabbit</td>
                    <td align="right" valign="middle">
                      <span style="display:inline-block;padding:6px 10px;border:1px solid #5D18EB;border-radius:999px;font-size:11px;line-height:14px;letter-spacing:0.3px;font-weight:700;color:#5D18EB;text-transform:uppercase;">
                        Verify
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
                    <td style="font-size:24px;line-height:32px;font-weight:700;color:#1A1A1A;">
                      Confirm your email
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:12px;font-size:15px;line-height:24px;color:#6B7280;">
                      Enter this verification code in the Tabbit app to finish creating your account.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:18px;">
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #E2DEE8;border-radius:12px;background-color:#F9F8FB;">
                        <tr>
                          <td align="center" style="padding:16px;font-size:28px;line-height:34px;letter-spacing:4px;font-weight:700;color:#1A1A1A;">
                            {{ .Token }}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid #E2DEE8;font-size:12px;line-height:18px;color:#6B7280;text-align:center;">
                Tabbit · Shared expenses made simple.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## Reset Password

Use this for the **Reset password** template.
Required placeholder: `{{ .ConfirmationURL }}`.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your Tabbit password</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F3F1F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;line-height:0;mso-hide:all;">
      Reset your Tabbit password.
    </span>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#F3F1F6;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background-color:#FFFFFF;border:1px solid #E2DEE8;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;border-bottom:1px solid #E2DEE8;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="font-size:22px;line-height:28px;font-weight:700;color:#1A1A1A;">Tabbit</td>
                    <td align="right" valign="middle">
                      <span style="display:inline-block;padding:6px 10px;border:1px solid #5D18EB;border-radius:999px;font-size:11px;line-height:14px;letter-spacing:0.3px;font-weight:700;color:#5D18EB;text-transform:uppercase;">
                        Security
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
                    <td style="font-size:24px;line-height:32px;font-weight:700;color:#1A1A1A;">
                      Reset your password
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:12px;font-size:15px;line-height:24px;color:#6B7280;">
                      We received a request to reset your Tabbit password. Open the link below to continue.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:16px;font-size:15px;line-height:24px;">
                      <a href="{{ .ConfirmationURL }}" style="color:#5D18EB;font-weight:600;text-decoration:underline;">
                        Reset password
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:12px;font-size:13px;line-height:20px;color:#6B7280;word-break:break-all;">
                      If the link above does not open, copy and paste this URL:<br />
                      {{ .ConfirmationURL }}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid #E2DEE8;font-size:12px;line-height:18px;color:#6B7280;text-align:center;">
                If you did not request this, you can safely ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```
