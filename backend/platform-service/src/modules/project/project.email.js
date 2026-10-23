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

const formatDate = (dateVal) => {
  if (!dateVal) return "—";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

/**
 * Generates branded HTML for project review decision emails.
 */
export const buildProjectReviewEmailHtml = ({
  project,
  decision,
  reviewComments,
  rejectionReason,
  vendorName,
}) => {
  const projectCodeEscaped = escapeHtml(project?.projectId || "Project");
  const projectNameEscaped = escapeHtml(project?.projectName || "Field Services");
  const clientEscaped = escapeHtml(project?.client || "Client");
  const serviceCategoryEscaped = escapeHtml(project?.serviceTypeName || "General Inspection");
  const locationEscaped = escapeHtml(project?.location || "Field Site");
  const recipientGreeting = escapeHtml(vendorName ? vendorName.trim() : "Vendor Partner");

  let badgeText = "Under Review";
  let badgeBg = "#E8E2DE";
  let badgeColor = "#3E3734";
  let badgeBorder = "#D1C7C0";
  let decisionTitle = "Project Review Update";
  let decisionIntro = "";
  let feedbackTitle = "";
  let feedbackContent = "";
  let nextStepsTitle = "Next Steps";
  let nextStepsContent = "";

  if (decision === "Approved") {
    badgeText = "Approved";
    badgeBg = "#E8F5E9";
    badgeColor = "#2E7D32";
    badgeBorder = "#C8E6C9";
    decisionTitle = "Project Submission Approved";
    decisionIntro = `We are pleased to inform you that your project submission for <strong>${projectNameEscaped}</strong> (<code>${projectCodeEscaped}</code>) has been approved following administrative quality review.`;
    nextStepsTitle = "Next Steps in Workflow";
    nextStepsContent =
      "Your field evidence has successfully passed verification. This project is now eligible for invoicing. You can log into your FieldCam vendor portal or mobile app to generate and submit your invoice for payment.";

    if (reviewComments && reviewComments.trim()) {
      feedbackTitle = "Admin Review Notes";
      feedbackContent = escapeHtml(reviewComments.trim()).replace(/\n/g, "<br/>");
    }
  } else if (decision === "Rejected") {
    badgeText = "Rejected";
    badgeBg = "#FFEBEE";
    badgeColor = "#C62828";
    badgeBorder = "#FFCDD2";
    decisionTitle = "Project Submission Rejected";
    decisionIntro = `Your project submission for <strong>${projectNameEscaped}</strong> (<code>${projectCodeEscaped}</code>) was rejected following administrative review.`;
    feedbackTitle = "Rejection Reason & Review Notes";
    const reasonText = (rejectionReason || reviewComments || "Field evidence does not meet standard quality criteria.").trim();
    feedbackContent = escapeHtml(reasonText).replace(/\n/g, "<br/>");
    nextStepsTitle = "How to Proceed";
    nextStepsContent =
      "Please carefully review the rejection feedback above. If you have questions or require clarification regarding the decision, please contact your project manager or reach out through FieldCam Support.";
  } else if (decision === "In Progress") {
    badgeText = "Retake Required";
    badgeBg = "#FFF3E0";
    badgeColor = "#E65100";
    badgeBorder = "#FFE0B2";
    decisionTitle = "Action Required: Photo Retake Requested";
    decisionIntro = `Corrected or replacement evidence has been requested for project <strong>${projectNameEscaped}</strong> (<code>${projectCodeEscaped}</code>). The project status has been returned to <strong>In Progress</strong>.`;
    feedbackTitle = "Retake Instructions & Feedback";
    const commentsText = (reviewComments || "Please recapture the requested checklist photos ensuring sharp focus, adequate lighting, and proper framing.").trim();
    feedbackContent = escapeHtml(commentsText).replace(/\n/g, "<br/>");
    nextStepsTitle = "How to Complete Retake";
    nextStepsContent =
      "1. Open the project in the FieldCam mobile app or web portal.<br/>2. Review the checklist items and recapture the required photos as detailed in the instructions above.<br/>3. Resubmit the project once all necessary items have been updated.";
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(decisionTitle)}</title>
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
                    <p style="margin: 4px 0 0 0; color: #D1C7C0; font-size: 13px;">Field Operations &amp; Evidence Verification</p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #3E3734; font-size: 19px; font-weight: 700;">${escapeHtml(decisionTitle)}</h2>
              <p style="margin: 0 0 20px 0; color: #554F4B; font-size: 14px; line-height: 22px;">
                Hello <strong>${recipientGreeting}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; color: #554F4B; font-size: 14px; line-height: 22px;">
                ${decisionIntro}
              </p>

              <!-- Project Summary Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F5; border-radius: 12px; margin-bottom: 24px; border: 1px solid #E8E2DE;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding-bottom: 10px; color: #817B77; width: 38%;">Project Code</td>
                        <td align="right" style="padding-bottom: 10px; color: #3E3734; font-weight: 700; font-family: monospace;">${projectCodeEscaped}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px; color: #817B77;">Project Name</td>
                        <td align="right" style="padding-bottom: 10px; color: #3E3734; font-weight: 600;">${projectNameEscaped}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px; color: #817B77;">Client</td>
                        <td align="right" style="padding-bottom: 10px; color: #3E3734; font-weight: 500;">${clientEscaped}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px; color: #817B77;">Service Category</td>
                        <td align="right" style="padding-bottom: 10px; color: #3E3734; font-weight: 500;">${serviceCategoryEscaped}</td>
                      </tr>
                      <tr>
                        <td style="color: #817B77;">Location</td>
                        <td align="right" style="color: #3E3734; font-weight: 500;">${locationEscaped}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Feedback / Review Notes Callout (if present) -->
              ${
                feedbackTitle
                  ? `
              <div style="background-color: ${
                decision === "Rejected" ? "#FFEBEE" : decision === "In Progress" ? "#FFF3E0" : "#F4F0ED"
              }; border-left: 4px solid ${
                      decision === "Rejected" ? "#C62828" : decision === "In Progress" ? "#E65100" : "#3E3734"
                    }; border-radius: 4px 8px 8px 4px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: ${
                  decision === "Rejected" ? "#C62828" : decision === "In Progress" ? "#BF360C" : "#3E3734"
                }; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${escapeHtml(feedbackTitle)}
                </p>
                <div style="margin: 0; color: #3E3734; font-size: 13px; line-height: 20px;">
                  ${feedbackContent}
                </div>
              </div>`
                  : ""
              }

              <!-- Next Steps Box -->
              <div style="background-color: #F8F9FA; border: 1px solid #E8E2DE; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #3E3734; font-size: 13px; font-weight: 700;">
                  ${escapeHtml(nextStepsTitle)}
                </p>
                <p style="margin: 0; color: #554F4B; font-size: 13px; line-height: 20px;">
                  ${nextStepsContent}
                </p>
              </div>

              <p style="margin: 0; color: #817B77; font-size: 12px; line-height: 18px;">
                For support and inquiries, please open FieldCam Live Chat or submit a support ticket in your portal.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF7F5; border-top: 1px solid #E8E2DE; padding: 20px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #817B77; font-size: 12px; font-weight: 600;">FieldCam Platform Automated Notification</p>
              <p style="margin: 0; color: #A39A94; font-size: 11px;">Please do not reply directly to this automated email address.</p>
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
 * Dispatches a review decision notification email to the vendor via Brevo.
 * Designed to never throw unhandled errors that could rollback the saved review decision.
 */
export const sendProjectReviewEmail = async ({
  project,
  decision,
  reviewComments,
  rejectionReason,
  recipientEmail,
  recipientName,
}) => {
  // 1. Validate Recipient Email Address
  if (!recipientEmail || typeof recipientEmail !== "string" || !recipientEmail.trim()) {
    return {
      sent: false,
      reason: "No vendor email address associated with project",
    };
  }

  const trimmedRecipient = recipientEmail.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedRecipient)) {
    return {
      sent: false,
      reason: "Invalid vendor email address format",
    };
  }

  // 2. Validate Brevo Provider Configuration
  if (!isEmailConfigured()) {
    return {
      sent: false,
      reason: "Email provider is not configured: missing BREVO_API_KEY or BREVO_SENDER_EMAIL",
    };
  }

  const apiKey = process.env.BREVO_API_KEY.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL.trim();
  const senderName = (process.env.BREVO_SENDER_NAME || "FieldCam").trim();

  // 3. Subject Construction
  let subject = "";
  if (decision === "Approved") {
    subject = `Project Approved: ${project.projectId} - ${project.projectName}`;
  } else if (decision === "Rejected") {
    subject = `Project Submission Rejected: ${project.projectId} - ${project.projectName}`;
  } else if (decision === "In Progress") {
    subject = `Action Required: Photo Retake Requested - ${project.projectId}`;
  } else {
    subject = `Project Review Update: ${project.projectId} - ${project.projectName}`;
  }

  // 4. Content Generation
  const html = buildProjectReviewEmailHtml({
    project,
    decision,
    reviewComments,
    rejectionReason,
    vendorName: recipientName,
  });

  // 5. Initialize Brevo Client
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

  // 6. Safe Dispatch
  try {
    const masked = maskEmail(trimmedRecipient);
    console.log(
      `[Project Review Email] Sending ${decision} notification for ${project.projectId} to ${masked} via Brevo...`
    );

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    const messageId =
      result?.messageId ||
      result?.body?.messageId ||
      result?.response?.body?.messageId ||
      (Array.isArray(result?.messageIds) ? result.messageIds[0] : null) ||
      (Array.isArray(result?.body?.messageIds) ? result.body.messageIds[0] : null);

    console.log(
      `[Project Review Email] Project ${project.projectId} review notification sent via Brevo (Message ID: ${
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
      "Failed to deliver review notification email via Brevo";

    console.error(
      `[Project Review Email] Brevo dispatch error for ${project.projectId}:`,
      rawErrorMsg
    );

    return {
      sent: false,
      error: rawErrorMsg,
      recipient: maskEmail(trimmedRecipient),
    };
  }
};
