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
