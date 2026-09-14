import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: false,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["SUPER_ADMIN", "ADMIN", "VENDOR", "STAFF"],
        message: "{VALUE} is not a valid role",
      },
      default: "STAFF",
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    phone: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    registrationOtpHash: {
      type: String,
      select: false,
      default: null,
    },

    registrationOtpExpires: {
      type: Date,
      default: null,
    },

    resetOtpHash: {
      type: String,
      select: false,
      default: null,
    },

    resetOtpExpires: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "INACTIVE", "SUSPENDED"],
        message: "{VALUE} is not a valid status",
      },
      default: "INACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;