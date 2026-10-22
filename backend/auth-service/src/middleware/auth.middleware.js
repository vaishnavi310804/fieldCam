import jwt from "jsonwebtoken";
import User from "../modules/auth/auth.model.js";
import { checkUserAndCompanyStatus } from "../modules/auth/companyStatus.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: jwtErr.message || "Invalid or expired token.",
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload identity.",
      });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Centrally enforce account and company status
    try {
      const companyVerification = await checkUserAndCompanyStatus(user);
      if (companyVerification.company?._id && !user.companyId) {
        user.companyId = companyVerification.company._id;
      }
    } catch (statusError) {
      const statusCode = statusError.statusCode || 403;
      return res.status(statusCode).json({
        success: false,
        code: statusError.code,
        message: statusError.message,
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Protect Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal authentication error.",
    });
  }
};