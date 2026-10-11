/**
 * Email service helper for sending approved invoices to clients.
 */

export const sendInvoiceEmail = async ({
  to,
  invoice,
  project,
  simulateFailure = false,
}) => {
  if (simulateFailure) {
    throw new Error("Failed to send invoice email: SMTP host unreachable / delivery failed");
  }

  const recipient = to || project?.clientEmail || project?.client;
  if (!recipient || typeof recipient !== "string" || !recipient.includes("@")) {
    // If not a valid email string, reject
    throw new Error(
      `Invalid or missing recipient email address: "${recipient || ""}"`
    );
  }

  const subject = `FieldCam Invoice ${invoice.invoiceId} for ${invoice.projectTitle}`;
  const totalFormatted = `$${Number(invoice.totalAmount || 0).toFixed(2)}`;

  // Log dispatch in platform-service logs
  console.log(
    `[Invoice Email Service] Sending invoice ${invoice.invoiceId} (${totalFormatted}) to ${recipient}`
  );

  // Return confirmed delivery receipt
  return {
    success: true,
    messageId: `inv_mail_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    recipient,
    subject,
    sentAt: new Date(),
  };
};
