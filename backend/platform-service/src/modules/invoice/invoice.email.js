import brevo from "@getbrevo/brevo";

/**
 * Masks an email address for privacy-safe logging (e.g. "j***e@domain.com").
 * @param {string} email
 * @returns {string}
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
 * Escapes dynamic string values to prevent HTML injection in emails.
 * @param {string|number|null|undefined} str
 * @returns {string}
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
 * Builds the responsive HTML body for the invoice transactional email.
 * @param {Object} params
 * @returns {string}
 */
export const buildInvoiceEmailHtml = ({
  invoice,
  project,
  totalFormatted,
  invoiceDateFormatted,
  dueDateFormatted,
  escapedNotes,
}) => {
  const invoiceIdEscaped = escapeHtml(invoice.invoiceId);
  const projectTitleEscaped = escapeHtml(
    invoice.projectTitle || project?.projectName || "Field Services"
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceIdEscaped}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0;">
          <!-- Header -->
          <tr>
            <td style="background-color: #5141F5; padding: 32px; text-align: left;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">FieldCam</h1>
              <p style="margin: 6px 0 0 0; color: #E0E7FF; font-size: 14px;">Field Operations &amp; Verification Platform</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #0F172A; font-size: 20px; font-weight: 600;">Invoice Ready for Review</h2>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 24px;">
                Please find attached the official invoice <strong>${invoiceIdEscaped}</strong> for <strong>${projectTitleEscaped}</strong>.
              </p>

              <!-- Summary Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9; border-radius: 8px; margin-bottom: 24px; border: 1px solid #E2E8F0;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 12px; color: #64748B; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Invoice Number</td>
                        <td align="right" style="padding-bottom: 12px; color: #0F172A; font-size: 14px; font-weight: 600;">${invoiceIdEscaped}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; color: #64748B; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Project</td>
                        <td align="right" style="padding-bottom: 12px; color: #0F172A; font-size: 14px; font-weight: 500;">${projectTitleEscaped}</td>
                      </tr>
                      ${
                        invoiceDateFormatted
                          ? `<tr>
                        <td style="padding-bottom: 12px; color: #64748B; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Invoice Date</td>
                        <td align="right" style="padding-bottom: 12px; color: #0F172A; font-size: 14px;">${escapeHtml(invoiceDateFormatted)}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        dueDateFormatted
                          ? `<tr>
                        <td style="padding-bottom: 12px; color: #64748B; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Due Date</td>
                        <td align="right" style="padding-bottom: 12px; color: #DC2626; font-size: 14px; font-weight: 600;">${escapeHtml(dueDateFormatted)}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="border-top: 1px solid #CBD5E1; padding-top: 12px; color: #0F172A; font-size: 16px; font-weight: 700;">Total Amount Due</td>
                        <td align="right" style="border-top: 1px solid #CBD5E1; padding-top: 12px; color: #5141F5; font-size: 20px; font-weight: 700;">${escapeHtml(totalFormatted)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Attachment Note -->
              <div style="background-color: #EEF2FF; border-left: 4px solid #5141F5; padding: 14px 16px; border-radius: 0 6px 6px 0; margin-bottom: 24px;">
                <p style="margin: 0; color: #3730A3; font-size: 14px; line-height: 20px;">
                  &#128206; <strong>PDF Attached:</strong> The complete itemized invoice document with breakdown and payment instructions is attached to this email.
                </p>
              </div>

              <!-- Notes / Instructions -->
              ${
                escapedNotes
                  ? `<div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 8px 0; color: #0F172A; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Notes &amp; Instructions</h3>
                <div style="margin: 0; color: #475569; font-size: 14px; line-height: 22px; background: #FAF5FF; padding: 12px; border-radius: 6px; border: 1px solid #F3E8FF;">
                  ${escapedNotes}
                </div>
              </div>`
                  : ""
              }

              <p style="margin: 0; color: #64748B; font-size: 14px; line-height: 22px;">
                If you have any questions regarding this invoice, please reply to this email or reach out to your FieldCam administrator.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0; color: #94A3B8; font-size: 12px;">
                &copy; ${new Date().getFullYear()} FieldCam Platform. All rights reserved.
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
 * Dispatches an approved invoice to a client recipient using Brevo Transactional Email API.
 * Attaches the generated PDF buffer as an itemized attachment.
 *
 * @param {Object} params
 * @param {string} [params.to] - Optional explicit recipient override entered by admin
 * @param {Object} params.invoice - Invoice document
 * @param {Object} [params.project] - Associated project document
 * @param {Object} [params.vendor] - Associated vendor document
 * @param {Buffer} params.pdfBuffer - Generated PDF buffer
 * @param {boolean} [params.simulateFailure=false] - For testing failure paths
 * @returns {Promise<{success: boolean, messageId: string, recipient: string, subject: string, sentAt: Date}>}
 */
export const sendInvoiceEmail = async ({
  to,
  invoice,
  project,
  vendor,
  pdfBuffer,
  simulateFailure = false,
}) => {
  if (simulateFailure) {
    const simErr = new Error("Failed to send invoice email: Simulated delivery failure");
    simErr.statusCode = 502;
    throw simErr;
  }

  // 1. Validate Brevo Configuration
  const apiKey = process.env.BREVO_API_KEY;
  const senderName = process.env.BREVO_SENDER_NAME || "FieldCam";
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !apiKey.trim() || !senderEmail || !senderEmail.trim()) {
    const configErr = new Error(
      "Brevo email service is not configured. Missing BREVO_API_KEY or BREVO_SENDER_EMAIL."
    );
    configErr.statusCode = 500;
    throw configErr;
  }

  // 2. Validate Recipient Address
  // Admin-supplied recipient takes highest precedence, followed by project.clientEmail or client string
  const rawRecipient = (
    to ||
    project?.clientEmail ||
    (project?.client && project.client.includes("@") ? project.client : "") ||
    ""
  ).trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!rawRecipient || !emailRegex.test(rawRecipient)) {
    const recipientErr = new Error(
      `Invalid or missing recipient email address: "${rawRecipient}"`
    );
    recipientErr.statusCode = 400;
    throw recipientErr;
  }

  // 3. Validate Invoice Structure
  if (!invoice || !invoice.invoiceId) {
    const invErr = new Error("Invalid invoice data: missing invoiceId");
    invErr.statusCode = 400;
    throw invErr;
  }

  // 4. Validate PDF Buffer
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
    const pdfErr = new Error("Missing or empty invoice PDF buffer for email attachment");
    pdfErr.statusCode = 500;
    throw pdfErr;
  }

  // 5. Build Formatted Metadata & Email Content
  const totalAmountNum = Number(invoice.totalAmount || invoice.amount || 0);
  const totalFormatted = `$${totalAmountNum.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formatDate = (dateVal) => {
    if (!dateVal) return null;
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  const invoiceDateFormatted = formatDate(invoice.invoiceDate);
  const dueDateFormatted = formatDate(invoice.dueDate);
  const escapedNotes = invoice.notes
    ? escapeHtml(invoice.notes).replace(/\n/g, "<br/>")
    : null;

  const subject = `Invoice ${invoice.invoiceId} from FieldCam - ${
    invoice.projectTitle || project?.projectName || "Field Services"
  }`;

  const html = buildInvoiceEmailHtml({
    invoice,
    project,
    totalFormatted,
    invoiceDateFormatted,
    dueDateFormatted,
    escapedNotes,
  });

  const safeFilename = `${
    String(invoice.invoiceId).replace(/[^a-zA-Z0-9_-]/g, "_") || "invoice"
  }.pdf`;

  // 6. Initialize Brevo SDK Client
  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey.trim());

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = {
    name: senderName.trim(),
    email: senderEmail.trim(),
  };
  sendSmtpEmail.to = [{ email: rawRecipient }];
  sendSmtpEmail.attachment = [
    {
      name: safeFilename,
      content: pdfBuffer.toString("base64"),
    },
  ];

  // 7. Execute Dispatch
  try {
    const maskedRecipient = maskEmail(rawRecipient);
    console.log(
      `[Invoice Email Service] Sending invoice ${invoice.invoiceId} (${totalFormatted}) to ${maskedRecipient} via Brevo...`
    );

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    const messageId =
      result?.messageId ||
      result?.body?.messageId ||
      result?.response?.body?.messageId ||
      (Array.isArray(result?.messageIds) ? result.messageIds[0] : null) ||
      (Array.isArray(result?.body?.messageIds) ? result.body.messageIds[0] : null);

    if (!messageId && !result) {
      const emptyErr = new Error("Brevo accepted request but returned an empty response");
      emptyErr.statusCode = 502;
      throw emptyErr;
    }

    console.log(
      `[Invoice Email Service] Invoice ${invoice.invoiceId} accepted by Brevo (Message ID: ${
        messageId || "accepted"
      })`
    );

    return {
      success: true,
      messageId: messageId || `brevo_${Date.now()}`,
      recipient: rawRecipient,
      subject,
      sentAt: new Date(),
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    const rawError =
      error?.response?.body ||
      error?.body ||
      error?.response ||
      error?.message ||
      error;
    console.error("[Invoice Email Service] Brevo dispatch error:", rawError);

    const providerMsg =
      error?.response?.body?.message ||
      error?.body?.message ||
      error?.message ||
      "Failed to deliver invoice email via Brevo";

    const err = new Error(providerMsg);
    const status = error?.response?.statusCode || error?.status || error?.statusCode;

    if (status === 400) {
      err.statusCode = 400;
    } else if (status === 401 || status === 403) {
      err.statusCode = 502;
      err.message = `Brevo authentication failed: ${providerMsg}`;
    } else if (status === 429) {
      err.statusCode = 429;
      err.message = `Brevo rate limit or quota exceeded: ${providerMsg}`;
    } else {
      err.statusCode = 502;
    }

    throw err;
  }
};
