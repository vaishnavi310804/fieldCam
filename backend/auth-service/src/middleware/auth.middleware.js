import jwt from "jsonwebtoken";
import User from "../modules/auth/auth.model.js";

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Protect Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message: error.message || "Invalid or expired token.",
    });
  }
};