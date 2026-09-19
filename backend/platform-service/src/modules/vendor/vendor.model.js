import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    contactName: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
    },
    initials: {
      type: String,
      trim: true,
    },
    avatarBg: {
      type: String,
      default: "#C87A65",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    services: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
      default: 4,
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Suspended", "Inactive"],
        message: "{VALUE} is not a valid vendor status",
      },
      default: "Active",
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
vendorSchema.index({ status: 1 });

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);

export default Vendor;
