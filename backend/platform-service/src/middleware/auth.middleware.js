import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import { checkUserAndCompanyStatus } from "../modules/vendor/companyStatus.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Bearer token missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Invalid token format.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    // Validate payload identity requirements
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload identity.",
      });
    }

    const user = await User.findById(decoded.id).select(
      "name email role status companyId"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Centrally enforce account and company status
    let companyVerification;
    try {
      companyVerification = await checkUserAndCompanyStatus(user);
    } catch (statusError) {
      const statusCode = statusError.statusCode || 403;
      return res.status(statusCode).json({
        success: false,
        code: statusError.code,
        message: statusError.message,
      });
    }

    const resolvedCompanyId = companyVerification.company?._id
      ? companyVerification.company._id.toString()
      : user.companyId
      ? user.companyId.toString()
      : decoded.companyId || null;

    // Attach user identity to req.user (without exposing raw token)
    req.user = {
      id: user._id.toString(),
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      companyId: resolvedCompanyId,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal authentication error.",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};
