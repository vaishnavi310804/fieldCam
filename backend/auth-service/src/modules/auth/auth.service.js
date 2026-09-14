import User from "./auth.model.js";
import {
  generateOTP,
  hashOTP,
  hashPassword,
  comparePassword,
  generateAccessToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
} from "./auth.utils.js";

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

  // Create new user without password
  const user = await User.create({
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

  const userObject = user.toObject();
  delete userObject.registrationOtpHash;

  // Return generated OTP temporarily for dev/testing alongside user
  return {
    user: userObject,
    otp,
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

  const userObject = user.toObject();
  delete userObject.registrationOtpHash;
  return userObject;
};

export const completeProfile = async (data) => {
  const { userId, password, profileImage } = data;

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isVerified) {
    throw new Error("User registration must be verified before completing profile");
  }

  // Hash password & update details
  const hashedPassword = await hashPassword(password);
  user.password = hashedPassword;
  if (profileImage) {
    user.profileImage = profileImage;
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

export const loginUser = async (credentials) => {
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

  return {
    message: "Password reset OTP generated successfully",
    otp,
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
