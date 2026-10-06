import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "7d",
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOTP = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};

const getPasswordResetSecret = () => {
  const secret = process.env.PASSWORD_RESET_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret key is not defined in environment variables");
  }
  return secret;
};

export const generatePasswordResetToken = (user) => {
  const secret = getPasswordResetSecret();
  const expiresIn = process.env.PASSWORD_RESET_EXPIRES || "15m";
  return jwt.sign(
    {
      id: user._id,
      purpose: "password-reset",
    },
    secret,
    {
      expiresIn,
    }
  );
};

export const verifyPasswordResetToken = (token) => {
  const secret = getPasswordResetSecret();
  return jwt.verify(token, secret);
};

export const generateOnboardingSetupToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      purpose: "complete-profile",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

export const verifyOnboardingSetupToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};