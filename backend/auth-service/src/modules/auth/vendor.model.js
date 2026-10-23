import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    contactName: {
      type: String,
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
      trim: true,
    },
    services: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 4,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Suspended", "Inactive"],
        message: "{VALUE} is not a valid vendor status",
      },
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

vendorSchema.index({ userId: 1 });
vendorSchema.index({ status: 1 });

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);

export default Vendor;
