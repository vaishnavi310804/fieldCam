import mongoose from "mongoose";

const vendorRegistrationSchema = new mongoose.Schema(
  {
    contactName: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
      minlength: [2, "Contact name must be at least 2 characters"],
      maxlength: [100, "Contact name cannot exceed 100 characters"],
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters"],
      maxlength: [150, "Company name cannot exceed 150 characters"],
    },
    email: {
      type: String,
      required: [true, "Business email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      minlength: [7, "Phone number must be at least 7 characters"],
    },
    location: {
      type: String,
      required: [true, "Business address or operating location is required"],
      trim: true,
      minlength: [3, "Location must be at least 3 characters"],
    },
    services: {
      type: [String],
      required: [true, "Services offered are required"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one service offered must be specified",
      },
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: ["PENDING", "APPROVED", "REJECTED"],
        message: "{VALUE} is not a valid registration status",
      },
      default: "PENDING",
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewerEmail: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
vendorRegistrationSchema.index({ status: 1 });
vendorRegistrationSchema.index({ email: 1 });
vendorRegistrationSchema.index({ createdAt: -1 });

const VendorRegistration =
  mongoose.models.VendorRegistration ||
  mongoose.model("VendorRegistration", vendorRegistrationSchema);

export default VendorRegistration;
