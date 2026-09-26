import User from "./auth.model.js";
import {
  generateOTP,
  hashOTP,
  hashPassword,
  comparePassword,
  generateAccessToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generateOnboardingSetupToken,
  verifyOnboardingSetupToken,
} from "./auth.utils.js";
import {
  sendRegistrationOTP,
  sendForgotPasswordOTP,
} from "../../services/email.service.js";

export const createUserByAdmin = async (userData) => {
  const { name, email, phone, role, companyId } = userData;

  // Check if email already exists
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new Error("Email already registered");
  }

  // Check if phone already exists
  if (phone) {
    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      throw new Error("Phone number already registered");
    }
  }

  const otp = generateOTP();
  const registrationOtpHash = await hashOTP(otp);
  const registrationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  let user = null;
  try {
    // Create new user without password
    user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      role,
      companyId: companyId || null,
      isVerified: false,
      status: "INACTIVE",
      registrationOtpHash,
      registrationOtpExpires,
    });

    // Send registration OTP via Brevo email
    await sendRegistrationOTP(user.email, otp);
  } catch (err) {
    if (user) {
      await User.findByIdAndDelete(user._id);
    }
    throw err;
  }

  const userObject = user.toObject();
  delete userObject.registrationOtpHash;
  delete userObject.registrationOtpExpires;

  return {
    user: userObject,
  };
};

export const sendRegistrationOTPEmail = async (data) => {
  const { email, otp } = data;
  await sendRegistrationOTP(email.toLowerCase().trim(), otp);
  return {
    success: true,
    message: "Registration OTP email sent successfully",
  };
};

export const verifyRegistrationOTP = async (data) => {
  const { email, otp } = data;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+registrationOtpHash"
  );
  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("User is already verified");
  }

  if (!user.registrationOtpExpires || user.registrationOtpExpires < new Date()) {
    throw new Error("Registration OTP has expired");
  }

  const hashedOtp = await hashOTP(otp);
  if (!user.registrationOtpHash || user.registrationOtpHash !== hashedOtp) {
    throw new Error("Invalid OTP");
  }

  // Update verification status and clear OTP details
  user.isVerified = true;
  user.registrationOtpHash = null;
  user.registrationOtpExpires = null;

  await user.save();

  const setupToken = generateOnboardingSetupToken(user);

  const userObject = user.toObject();
  delete userObject.registrationOtpHash;
  delete userObject.registrationOtpExpires;

  return {
    user: userObject,
    setupToken,
  };
};

export const completeProfile = async (data, setupTokenFromHeader) => {
  const setupToken = setupTokenFromHeader || data?.setupToken;

  if (!setupToken) {
    throw new Error("Onboarding setup token is required for password setup");
  }

  let decoded;
  try {
    decoded = verifyOnboardingSetupToken(setupToken);
  } catch (jwtErr) {
    if (jwtErr.name === "TokenExpiredError") {
      throw new Error("Onboarding setup token has expired. Please verify your OTP again");
    }
    throw new Error("Invalid or unauthorized onboarding setup token");
  }

  if (!decoded || decoded.purpose !== "complete-profile" || !decoded.id) {
    throw new Error("Invalid or unauthorized onboarding setup token");
  }

  const userId = decoded.id;

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isVerified) {
    throw new Error("User registration must be verified before completing profile");
  }

  if (user.status === "ACTIVE" || user.password) {
    throw new Error("Account setup is already complete or password has already been established");
  }

  // Hash password & update details
  const hashedPassword = await hashPassword(data.password);
  user.password = hashedPassword;
  if (data.profileImage) {
    user.profileImage = data.profileImage;
  }
  user.status = "ACTIVE";

  await user.save();

  const accessToken = generateAccessToken(user);

  const userObject = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    accessToken,
  };
};


export const webLoginUser = async (credentials) => {
  const { email, password } = credentials;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("Account is not active. Please contact administrator");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const allowedWebRoles = ["SUPER_ADMIN", "ADMIN", "VENDOR"];
  if (!allowedWebRoles.includes(user.role)) {
    throw new Error("Access denied. Invalid credentials for web login");
  }

  const accessToken = generateAccessToken(user);

  const userObject = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    accessToken,
  };
};

export const mobileLoginUser = async (credentials) => {
  const { phone, password } = credentials;

  const user = await User.findOne({ phone: phone.trim() }).select("+password");
  if (!user) {
    throw new Error("Invalid phone number or password");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("Account is not active. Please contact administrator");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid phone number or password");
  }

  const allowedMobileRoles = ["VENDOR", "STAFF"];
  if (!allowedMobileRoles.includes(user.role)) {
    throw new Error("Access denied. Invalid credentials for mobile login");
  }

  const accessToken = generateAccessToken(user);

  const userObject = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    accessToken,
  };
};

export const forgotPassword = async (data) => {
  const { email } = data;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("User not found");
  }

  const otp = generateOTP();
  const resetOtpHash = await hashOTP(otp);
  const resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.resetOtpHash = resetOtpHash;
  user.resetOtpExpires = resetOtpExpires;

  await user.save();

  // Send password reset OTP via Brevo email
  await sendForgotPasswordOTP(user.email, otp);

  return {
    message: "Password reset OTP sent to email successfully",
  };
};

export const verifyResetOTP = async (data) => {
  const { email, otp } = data;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+resetOtpHash"
  );
  if (!user) {
    throw new Error("User not found");
  }

  if (
    !user.resetOtpHash ||
    !user.resetOtpExpires ||
    user.resetOtpExpires < new Date()
  ) {
    throw new Error("Reset OTP has expired or does not exist");
  }

  const hashedOtp = await hashOTP(otp);
  if (hashedOtp !== user.resetOtpHash) {
    throw new Error("Invalid OTP");
  }

  const resetToken = generatePasswordResetToken(user);

  user.resetOtpHash = null;
  user.resetOtpExpires = null;

  await user.save();

  return {
    resetToken,
  };
};

export const resetPassword = async (data) => {
  const { resetToken, newPassword } = data;

  const decoded = verifyPasswordResetToken(resetToken);
  if (!decoded || decoded.purpose !== "password-reset") {
    throw new Error("Invalid or unauthorized reset token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error("User not found");
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;

  await user.save();

  return {
    message: "Password reset successfully",
  };
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId).select(
    "-password -registrationOtpHash -registrationOtpExpires -resetOtpHash -resetOtpExpires"
  );
  if (!user) {
    throw new Error("User not found");
  }
  return user.toObject();
};

export const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Explicit whitelist of allowed fields
  const allowedFields = [
    "firstName",
    "lastName",
    "phone",
    "location",
    "timezone",
    "title",
    "department",
    "bio",
    "socialLinks",
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });

  // Name Synchronization:
  const effectiveFirstName =
    updateData.firstName !== undefined ? updateData.firstName : user.firstName;
  const effectiveLastName =
    updateData.lastName !== undefined ? updateData.lastName : user.lastName;

  if (effectiveFirstName || effectiveLastName) {
    const combinedName = `${effectiveFirstName || ""} ${effectiveLastName || ""}`.trim();
    if (combinedName) {
      user.name = combinedName;
    }
  }

  await user.save();

  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.registrationOtpHash;
  delete userObject.registrationOtpExpires;
  delete userObject.resetOtpHash;
  delete userObject.resetOtpExpires;

  return userObject;
};
