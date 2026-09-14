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

export const generatePasswordResetToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      purpose: "password-reset",
    },
    process.env.PASSWORD_RESET_SECRET,
    {
      expiresIn: process.env.PASSWORD_RESET_EXPIRES,
    }
  );
};

export const verifyPasswordResetToken = (token) => {
  return jwt.verify(token, process.env.PASSWORD_RESET_SECRET);
};