import brevo from "@getbrevo/brevo";

/**
 * Safely masks an email address for logging and UI feedback.
 * e.g., 'vendor.partner@example.com' -> 'v***r@example.com'
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== "string") return "***";
  const parts = email.trim().split("@");
  if (parts.length !== 2) return "***";
  const [user, domain] = parts;
  if (user.length <= 2) {
    return `${user[0] || "*"}*@${domain}`;
  }
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
};

/**
 * Escapes dynamic string content for safe embedding into HTML emails.
 */
export const escapeHtml = (str) => {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Checks if the Brevo email provider is configured in environment variables.
 */
export const isEmailConfigured = () => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  return Boolean(apiKey && apiKey.trim() && senderEmail && senderEmail.trim());
};

/**
 * Generates branded HTML for vendor registration rejection emails.
 */
export const buildRegistrationRejectionEmailHtml = ({
  contactName,
  companyName,
  rejectionReason,
}) => {
  const contactNameEscaped = escapeHtml(contactName || "Vendor Partner");
  const companyNameEscaped = escapeHtml(companyName || "Your Company");
  const reasonEscaped = rejectionReason ? escapeHtml(rejectionReason.trim()) : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vendor Registration Request Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F5; color: #2D3436;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #E8E2DE;">
          <!-- Header -->
          <tr>
            <td style="background-color: #221F1E; padding: 28px 32px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">FieldCam</h1>
                    <p style="margin: 4px 0 0 0; color: #D1C7C0; font-size: 13px;">Partner & Vendor Operations</p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background-color: #FFEBEE; color: #C62828; border: 1px solid #FFCDD2;">
                      Not Approved
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #221F1E; font-size: 18px; font-weight: 700;">
                Vendor Registration Request Update
              </h2>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #554F4B;">
                Dear ${contactNameEscaped},
              </p>

              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #554F4B;">
                Thank you for your interest in partnering with FieldCam. We have completed our administrative review of the vendor registration request submitted for <strong>${companyNameEscaped}</strong>.
              </p>

              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #554F4B;">
                After thorough evaluation of our current platform requirements and service coverage, we regret to inform you that we are unable to approve your vendor registration request at this time.
              </p>

              <!-- Optional Rejection Reason Callout -->
              ${
                reasonEscaped
                  ? `
              <div style="background-color: #FFEBEE; border-left: 4px solid #C62828; border-radius: 4px 8px 8px 4px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 6px 0; color: #C62828; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  Review Feedback / Reason
                </p>
                <div style="margin: 0; color: #3E3734; font-size: 13px; line-height: 20px;">
                  ${reasonEscaped.replace(/\n/g, "<br/>")}
                </div>
              </div>`
                  : ""
              }

              <!-- Resubmission Guidance Box -->
              <div style="background-color: #F8F9FA; border: 1px solid #E8E2DE; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #3E3734; font-size: 13px; font-weight: 700;">
                  Next Steps & Resubmission
                </p>
                <p style="margin: 0 0 8px 0; color: #554F4B; font-size: 13px; line-height: 20px;">
                  No vendor or user account has been created on FieldCam for this request.
                </p>
                <p style="margin: 0; color: #554F4B; font-size: 13px; line-height: 20px;">
                  If your business details or services expand in the future, or if you would like to submit updated credentials, you are welcome to return to the FieldCam login screen and submit a new registration request at any time.
                </p>
              </div>

              <p style="margin: 0; color: #817B77; font-size: 12px; line-height: 18px;">
                If you have questions regarding this decision, you may reach out to FieldCam operations support.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF7F5; border-top: 1px solid #E8E2DE; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #A39A94; font-size: 11px;">
                Please do not reply directly to this automated notification email. &copy; 2026 FieldCam.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Generates branded HTML for vendor registration acknowledgement emails.
 */
export const buildRegistrationAcknowledgementEmailHtml = ({
  contactName,
  companyName,
  services,
}) => {
  const contactNameEscaped = escapeHtml(contactName || "Vendor Partner");
  const companyNameEscaped = escapeHtml(companyName || "Your Company");
  const servicesList = Array.isArray(services) ? services.map(escapeHtml).join(", ") : escapeHtml(services || "");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Request Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F5; color: #2D3436;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #E8E2DE;">
          <!-- Header -->
          <tr>
            <td style="background-color: #221F1E; padding: 28px 32px; text-align: left;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">FieldCam</h1>
              <p style="margin: 4px 0 0 0; color: #D1C7C0; font-size: 13px;">Vendor Registration Portal</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #221F1E; font-size: 18px; font-weight: 700;">
                Registration Request Received
              </h2>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #554F4B;">
                Dear ${contactNameEscaped},
              </p>

              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #554F4B;">
                We have received your vendor registration request for <strong>${companyNameEscaped}</strong>. Your application is currently awaiting review by a FieldCam administrator.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F5; border-radius: 12px; margin-bottom: 24px; border: 1px solid #E8E2DE;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #817B77; text-transform: uppercase;">Request Summary</p>
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #3E3734;"><strong>Company:</strong> ${companyNameEscaped}</p>
                    <p style="margin: 0; font-size: 13px; color: #3E3734;"><strong>Services:</strong> ${servicesList || "General Inspection"}</p>
                  </td>
                </tr>
              </table>

              <div style="background-color: #F8F9FA; border: 1px solid #E8E2DE; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #3E3734; font-size: 13px; font-weight: 700;">What Happens Next?</p>
                <p style="margin: 0; color: #554F4B; font-size: 13px; line-height: 20px;">
                  Our administrative team will review your application. Upon approval, you will receive an invitation email containing an OTP verification code to activate your vendor account and set up your password.
                </p>
              </div>

              <p style="margin: 0; color: #817B77; font-size: 12px; line-height: 18px;">
                Please note that no user account or login session has been established at this stage.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF7F5; border-top: 1px solid #E8E2DE; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #A39A94; font-size: 11px;">
                Automated notification from FieldCam. Please do not reply directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Dispatches a registration rejection email via Brevo.
 * Safe dispatch: never throws unhandled errors that could rollback the saved rejection status.
 */
export const sendRegistrationRejectionEmail = async ({
  request,
  rejectionReason,
}) => {
  const recipientEmail = request?.email;
  if (!recipientEmail || typeof recipientEmail !== "string" || !recipientEmail.trim()) {
    return {
      sent: false,
      reason: "No applicant email address found on registration request",
    };
  }

  const trimmedRecipient = recipientEmail.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedRecipient)) {
    return {
      sent: false,
      reason: "Invalid applicant email address format",
    };
  }

  if (!isEmailConfigured()) {
    return {
      sent: false,
      reason: "Email provider is not configured: missing BREVO_API_KEY or BREVO_SENDER_EMAIL",
    };
  }

  const apiKey = process.env.BREVO_API_KEY.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL.trim();
  const senderName = (process.env.BREVO_SENDER_NAME || "FieldCam").trim();

  const subject = `FieldCam Vendor Registration Request Update: ${request.companyName || "Application"}`;
  const html = buildRegistrationRejectionEmailHtml({
    contactName: request.contactName,
    companyName: request.companyName,
    rejectionReason: rejectionReason || request.rejectionReason,
  });

  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = {
    name: senderName,
    email: senderEmail,
  };
  sendSmtpEmail.to = [{ email: trimmedRecipient }];

  try {
    const masked = maskEmail(trimmedRecipient);
    console.log(
      `[Registration Rejection Email] Sending rejection email for ${request.companyName} to ${masked} via Brevo...`
    );

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    const messageId =
      result?.messageId ||
      result?.body?.messageId ||
      result?.response?.body?.messageId ||
      (Array.isArray(result?.messageIds) ? result.messageIds[0] : null) ||
      (Array.isArray(result?.body?.messageIds) ? result.body.messageIds[0] : null);

    console.log(
      `[Registration Rejection Email] Rejection notification sent via Brevo (Message ID: ${
        messageId || "accepted"
      })`
    );

    return {
      sent: true,
      messageId: messageId || `brevo_${Date.now()}`,
      recipient: masked,
      subject,
      sentAt: new Date(),
    };
  } catch (error) {
    const rawErrorMsg =
      error?.response?.body?.message ||
      error?.body?.message ||
      error?.message ||
      "Failed to deliver registration rejection email via Brevo";

    console.error(
      `[Registration Rejection Email] Brevo dispatch error for ${request.companyName}:`,
      rawErrorMsg
    );

    return {
      sent: false,
      error: rawErrorMsg,
      recipient: maskEmail(trimmedRecipient),
    };
  }
};

/**
 * Dispatches a registration acknowledgement email via Brevo.
 * Safe dispatch: never throws unhandled errors.
 */
export const sendRegistrationAcknowledgementEmail = async ({ request }) => {
  const recipientEmail = request?.email;
  if (!recipientEmail || typeof recipientEmail !== "string" || !recipientEmail.trim()) {
    return {
      sent: false,
      reason: "No applicant email address provided",
    };
  }

  const trimmedRecipient = recipientEmail.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedRecipient)) {
    return {
      sent: false,
      reason: "Invalid applicant email address format",
    };
  }

  if (!isEmailConfigured()) {
    return {
      sent: false,
      reason: "Email provider is not configured: missing BREVO_API_KEY or BREVO_SENDER_EMAIL",
    };
  }

  const apiKey = process.env.BREVO_API_KEY.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL.trim();
  const senderName = (process.env.BREVO_SENDER_NAME || "FieldCam").trim();

  const subject = `FieldCam — Vendor Registration Request Received (${request.companyName || ""})`.trim();
  const html = buildRegistrationAcknowledgementEmailHtml({
    contactName: request.contactName,
    companyName: request.companyName,
    services: request.services,
  });

  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = {
    name: senderName,
    email: senderEmail,
  };
  sendSmtpEmail.to = [{ email: trimmedRecipient }];

  try {
    const masked = maskEmail(trimmedRecipient);
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    const messageId =
      result?.messageId ||
      result?.body?.messageId ||
      (Array.isArray(result?.messageIds) ? result.messageIds[0] : null);

    return {
      sent: true,
      messageId: messageId || `brevo_${Date.now()}`,
      recipient: masked,
      subject,
      sentAt: new Date(),
    };
  } catch (error) {
    const rawErrorMsg =
      error?.response?.body?.message ||
      error?.body?.message ||
      error?.message ||
      "Failed to deliver registration acknowledgement email via Brevo";

    return {
      sent: false,
      error: rawErrorMsg,
      recipient: maskEmail(trimmedRecipient),
    };
  }
};
