import brevo from "@getbrevo/brevo";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL,
    };
    sendSmtpEmail.to = [{ email: to }];

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Brevo email sent successfully");

    return response;
  } catch (error) {
    console.error("Brevo Error Detail:", error?.response?.body || error?.body || error?.response || error?.message || error);
    throw new Error(error?.response?.body?.message || error?.body?.message || error?.message || "Failed to send email via Brevo");
  }
};

export const sendForgotPasswordOTP = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
      <h2>Reset Your Password</h2>

      <p>Hello,</p>

      <p>We received a request to reset your FIELDcam account password.</p>

      <p>Your One-Time Password (OTP) is:</p>

      <h1 style="
        text-align:center;
        background:#f5f5f5;
        padding:15px;
        letter-spacing:8px;
      ">
        ${otp}
      </h1>

      <p>This OTP is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>

      <p>If you didn't request this, you can ignore this email.</p>

      <br/>

      <strong>FIELDcam Team</strong>
    </div>
  `;
  return sendEmail({
    to: email,
    subject: "FIELDcam Password Reset OTP",
    html,
  });
};

export const sendEmailChangeOTP = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
      <h2>Verify Your New Email</h2>

      <p>Hello,</p>

      <p>Please use the OTP below to verify your new email address for your FIELDcam account.</p>

      <h1 style="
        text-align:center;
        background:#f5f5f5;
        padding:15px;
        letter-spacing:8px;
      ">
        ${otp}
      </h1>

      <p>This OTP is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>

      <br/>

      <strong>FIELDcam Team</strong>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your New Email Address - FIELDcam",
    html,
  });
};

export const sendRegistrationOTP = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto;">
      <h2>Welcome to FIELDcam 🎉</h2>
      <p>Hello,</p>
      <p>Your Vendor Account has been registered on the FIELDcam platform.</p>

      <p>Please verify your email address using the One-Time Password (OTP) below to complete your vendor onboarding:</p>

      <h1 style="
        text-align:center;
        background:#f5f5f5;
        padding:15px;
        letter-spacing:8px;
      ">
        ${otp}
      </h1>
      <p>This OTP is valid for <strong>10 minutes</strong>.</p>
      <p style="color: #d9534f; font-weight: bold;">For security reasons, do not share this OTP with anyone.</p>

      <p>If you did not expect this account registration, please contact your FIELDcam administrator.</p>
      <br/>
      <strong>FIELDcam Team</strong>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your FIELDcam Account",
    html,
  });
};

